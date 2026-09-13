// lib/memory.js — Génération du profil pédagogique de l'élève à partir de l'historique
const { query, queryOne, run } = require("./db");
const { completeChat } = require("./ai");
const { buildMemoryPrompt } = require("./prompts");

async function generateMemory(userId, chapitre) {
  const history = await query(
    `SELECT role, content FROM conversation_history
     WHERE user_id = ? AND chapitre = ?
     ORDER BY created_at DESC LIMIT 30`,
    [userId, chapitre]
  );

  // Il faut au moins 4 échanges réels pour générer un profil pertinent
  if (history.length < 4) return null;

  const user = await queryOne("SELECT profil_pedagogique FROM users WHERE id = ?", [userId]);
  const profilActuel = user?.profil_pedagogique || "";

  const conversationText = history
    .slice()
    .reverse()
    .map((m) => `${m.role === "user" ? "Élève" : "MathBot"}: ${m.content}`)
    .join("\n");

  const prompt = buildMemoryPrompt(chapitre, conversationText, profilActuel);

  try {
    const result = await completeChat({
      systemPrompt: "Tu es un assistant pédagogique rigoureux.",
      messages: [{ role: "user", content: prompt }],
      maxTokens: 400,
      temperature: 0.3,
    });

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const profil = JSON.parse(jsonMatch[0]);

    await run("UPDATE users SET profil_pedagogique = ?, profil_updated_at = NOW() WHERE id = ?", [
      JSON.stringify(profil),
      userId,
    ]);

    return profil;
  } catch (err) {
    console.error("[memory/generate]", err.message);
    return null;
  }
}

module.exports = { generateMemory };
