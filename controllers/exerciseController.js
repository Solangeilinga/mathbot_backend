// controllers/exerciseController.js
const { queryOne, run } = require("../lib/db");
const { buildExercisePrompt } = require("../lib/prompts");
const { completeChat, analyzeImage, getGeminiClient, isRateLimitError } = require("../lib/ai");
const { retrieveRelevantExercises, formatRagContext } = require("../lib/rag");

async function analyze(req, res) {
  const { imageBase64, imageType, exerciseText, chapitre } = req.body;
  const userId = req.user.id;

  if (!imageBase64 && !exerciseText?.trim()) {
    return res.status(400).json({ error: "Image ou texte requis." });
  }

  const userRow = await queryOne("SELECT prenom, profil_pedagogique FROM users WHERE id = ?", [userId]);
  const prenom = userRow?.prenom && userRow.prenom !== "undefined" ? userRow.prenom : "toi";
  const profil = userRow?.profil_pedagogique ? JSON.parse(userRow.profil_pedagogique) : null;

  const ragChunks = await retrieveRelevantExercises({
    chapitre,
    queryText: exerciseText || chapitre,
    topK: 3,
  });
  const systemPrompt = buildExercisePrompt(prenom, chapitre, profil) + formatRagContext(ragChunks);
  let reply = "";

  try {
    if (imageBase64) {
      if (!getGeminiClient()) {
        return res
          .status(500)
          .json({ error: "GEMINI_API_KEY manquant — nécessaire pour la reconnaissance d'image." });
      }
      reply = await analyzeImage({
        imageBase64,
        mimeType: imageType || "image/jpeg",
        prompt: systemPrompt + "\n\nAnalyse l'exercice visible sur cette image et suis le format demandé.",
      });
    } else {
      const userMessage = `Voici l'exercice à analyser :\n\n${exerciseText.trim()}\n\nAnalyse-le et suis le format demandé.`;
      reply = await completeChat({
        systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        maxTokens: 1800,
        temperature: 0.7,
      });
    }

    if (chapitre) {
      const userMsg = imageBase64
        ? "[Exercice envoyé en image]"
        : `[Exercice soumis] : ${exerciseText?.slice(0, 200)}`;
      await run(
        "INSERT INTO conversation_history (user_id, chapitre, role, content) VALUES (?, ?, 'user', ?)",
        [userId, chapitre, userMsg]
      );
      await run(
        "INSERT INTO conversation_history (user_id, chapitre, role, content) VALUES (?, ?, 'assistant', ?)",
        [userId, chapitre, reply]
      );
    }

    return res.json({ reply, hasImage: !!imageBase64 });
  } catch (err) {
    console.error("[exercise/analyze]", err.message);
    let status = 502;
    let msg = "Erreur IA — réessaie dans quelques secondes.";
    if (isRateLimitError(err)) {
      status = 429;
      msg = "Limite API atteinte, réessaie dans quelques secondes.";
    } else if (err.message.includes("GEMINI_API_KEY")) {
      status = 500;
      msg = err.message;
    } else if (err.message.includes("image") || err.message.includes("vision")) {
      msg = "Impossible de lire l'image. Vérifie que c'est bien une photo claire d'exercice.";
    }
    return res.status(status).json({ error: msg });
  }
}

module.exports = { analyze };
