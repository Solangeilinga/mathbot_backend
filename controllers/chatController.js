// controllers/chatController.js
const { query, queryOne, run } = require("../lib/db");
const { resolvePrenom } = require("../lib/user");
const { buildSystemPrompt, buildWelcomeInstruction } = require("../lib/prompts");
const { streamChatText } = require("../lib/ai");
const { generateMemory } = require("../lib/memory");
const { retrieveRelevantExercises, formatRagContext } = require("../lib/rag");

// GET /api/chat/welcome?chapitre=... — message de bienvenue en streaming
async function welcome(req, res) {
  const chapitre = req.query.chapitre;
  const userId = req.user.id;
  if (!chapitre) return res.status(400).json({ error: "chapitre requis." });

  let prenom, histCount, profilRow;
  try {
    [{ prenom }, histCount, profilRow] = await Promise.all([
      resolvePrenom(userId, req.user),
      queryOne(
        "SELECT COUNT(*) as cnt FROM conversation_history WHERE user_id = ? AND chapitre = ?",
        [userId, chapitre]
      ),
      queryOne("SELECT profil_pedagogique FROM users WHERE id = ?", [userId]),
    ]);
  } catch (err) {
    console.error("[chat/welcome] préparation:", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }

  const profil = profilRow?.profil_pedagogique ? JSON.parse(profilRow.profil_pedagogique) : null;
  const hasHistory = Number(histCount?.cnt || 0) > 2;
  const instruction = buildWelcomeInstruction(prenom, chapitre, profil, hasHistory);
  const systemPrompt = buildSystemPrompt(chapitre, profil, prenom);

  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });

  let fullText = "";
  try {
    for await (const piece of streamChatText({
      systemPrompt,
      messages: [{ role: "user", content: instruction }],
      maxTokens: 200,
      temperature: 0.92,
    })) {
      fullText += piece;
      res.write(piece);
    }
  } catch (err) {
    console.error("[chat/welcome] stream:", err.message);
    const fallback = prenom
      ? `Bonjour ${prenom} ! Je suis MathBot, prêt à travailler "${chapitre}" avec toi 😊`
      : `Bonjour ! Prêt à travailler "${chapitre}" ensemble 😊`;
    res.write(fallback);
    fullText = fallback;
  }

  res.end();

  try {
    if (fullText.trim()) {
      await run(
        "INSERT INTO conversation_history (user_id, chapitre, role, content) VALUES (?, ?, 'assistant', ?)",
        [userId, chapitre, fullText]
      );
    }
  } catch (err) {
    console.error("[chat/welcome] post-traitement:", err.message);
  }
}

// POST /api/chat/message — envoi d'un message, réponse en streaming + RAG
async function sendMessage(req, res) {
  const { message, chapitre } = req.body;
  const userId = req.user.id;
  if (!message || !chapitre) return res.status(400).json({ error: "message et chapitre requis." });

  let prenom, historyRows, profilRow, ragChunks;
  try {
    [{ prenom }, historyRows, profilRow, ragChunks] = await Promise.all([
      resolvePrenom(userId, req.user),
      query(
        "SELECT role, content FROM conversation_history WHERE user_id = ? AND chapitre = ? ORDER BY created_at ASC LIMIT 20",
        [userId, chapitre]
      ),
      queryOne("SELECT profil_pedagogique FROM users WHERE id = ?", [userId]),
      retrieveRelevantExercises({ chapitre, queryText: message, topK: 3 }),
    ]);
  } catch (err) {
    console.error("[chat/message] préparation:", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }

  const profil = profilRow?.profil_pedagogique ? JSON.parse(profilRow.profil_pedagogique) : null;
  const systemPrompt = buildSystemPrompt(chapitre, profil, prenom) + formatRagContext(ragChunks);

  await run(
    "INSERT INTO conversation_history (user_id, chapitre, role, content) VALUES (?, ?, 'user', ?)",
    [userId, chapitre, message]
  );

  // Le statut HTTP est envoyé maintenant : toute erreur pendant la génération
  // ne peut plus changer le code de statut, elle est ajoutée en texte visible.
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });

  let fullText = "";
  try {
    for await (const piece of streamChatText({
      systemPrompt,
      messages: [
        ...historyRows.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
      maxTokens: 600,
      temperature: 0.85,
    })) {
      fullText += piece;
      res.write(piece);
    }
  } catch (err) {
    console.error("[chat/message] stream:", err.message);
    const friendly =
      err.message.includes("quota") || err.message.includes("rate")
        ? "\n\n⏱️ Limite API atteinte, réessaie dans quelques secondes."
        : "\n\n⚠️ MathBot a rencontré une erreur pendant la réponse.";
    res.write(friendly);
    fullText += friendly;
  }

  res.end();

  // Post-traitement une fois le flux terminé : sauvegarde + progression + mémoire
  try {
    if (fullText.trim()) {
      await run(
        "INSERT INTO conversation_history (user_id, chapitre, role, content) VALUES (?, ?, 'assistant', ?)",
        [userId, chapitre, fullText]
      );
    }
    await run("UPDATE progression SET sessions = sessions + 1 WHERE user_id = ? AND chapitre = ?", [
      userId,
      chapitre,
    ]);

    const count = await queryOne(
      "SELECT COUNT(*) as cnt FROM conversation_history WHERE user_id = ? AND chapitre = ? AND role = 'assistant'",
      [userId, chapitre]
    );
    const cnt = Number(count?.cnt || 0);
    if (cnt > 0 && cnt % 10 === 0) {
      generateMemory(userId, chapitre).catch((e) => console.warn("[memory bg]", e.message));
    }
  } catch (err) {
    console.error("[chat/message] post-traitement:", err.message);
  }
}

// GET /api/chat/history/:chapitre
async function getHistory(req, res) {
  const chapitre = decodeURIComponent(req.params.chapitre);
  try {
    const rows = await query(
      "SELECT role, content, created_at FROM conversation_history WHERE user_id = ? AND chapitre = ? ORDER BY created_at ASC LIMIT 50",
      [req.user.id, chapitre]
    );
    return res.json({ history: rows });
  } catch (err) {
    console.error("[chat/history]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

// DELETE /api/chat/history/:chapitre
async function clearHistory(req, res) {
  const chapitre = decodeURIComponent(req.params.chapitre);
  try {
    await run("DELETE FROM conversation_history WHERE user_id = ? AND chapitre = ?", [
      req.user.id,
      chapitre,
    ]);
    return res.json({ message: "Historique effacé." });
  } catch (err) {
    console.error("[chat/clearHistory]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

module.exports = { welcome, sendMessage, getHistory, clearHistory };
