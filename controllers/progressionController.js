// controllers/progressionController.js
const { query, queryOne, run } = require("../lib/db");

async function getProgression(req, res) {
  const userId = req.user.id;
  try {
    const user = await queryOne("SELECT xp, niveau FROM users WHERE id = ?", [userId]);
    const chapitres = await query(
      "SELECT chapitre, score, sessions, exercices, reussites FROM progression WHERE user_id = ?",
      [userId]
    );
    return res.json({ xp: user?.xp ?? 0, niveau: user?.niveau ?? 1, chapitres });
  } catch (err) {
    console.error("[progression/get]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function logExercice(req, res) {
  const { chapitre, correct } = req.body;
  const userId = req.user.id;
  if (!chapitre || correct === undefined) {
    return res.status(400).json({ error: "chapitre et correct requis." });
  }

  const xpGagne = correct ? 20 : 5;

  try {
    await run("INSERT INTO exercices_log (user_id, chapitre, correct, xp_gagne) VALUES (?, ?, ?, ?)", [
      userId,
      chapitre,
      !!correct,
      xpGagne,
    ]);

    const prog = await queryOne(
      "SELECT exercices, reussites FROM progression WHERE user_id = ? AND chapitre = ?",
      [userId, chapitre]
    );

    const newExercices = (prog?.exercices || 0) + 1;
    const newReussites = (prog?.reussites || 0) + (correct ? 1 : 0);
    const newScore = newExercices > 0 ? Math.round((newReussites * 100) / newExercices) : 0;

    await run(
      "UPDATE progression SET exercices = ?, reussites = ?, score = ?, updated_at = NOW() WHERE user_id = ? AND chapitre = ?",
      [newExercices, newReussites, newScore, userId, chapitre]
    );

    const currentUser = await queryOne("SELECT xp FROM users WHERE id = ?", [userId]);
    const newXP = (currentUser?.xp || 0) + xpGagne;
    const newNiveau = Math.max(1, Math.floor(newXP / 100) + 1);

    await run("UPDATE users SET xp = ?, niveau = ?, updated_at = NOW() WHERE id = ?", [
      newXP,
      newNiveau,
      userId,
    ]);

    return res.json({
      xpGagne,
      xp: newXP,
      niveau: newNiveau,
      message: correct ? "Bonne réponse ! +20 XP 🎉" : "Bonne tentative ! +5 XP 💪",
    });
  } catch (err) {
    console.error("[progression/logExercice]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function leaderboard(req, res) {
  try {
    const top = await query("SELECT id, prenom, nom, xp, niveau FROM users ORDER BY xp DESC LIMIT 10");
    return res.json({ leaderboard: top });
  } catch (err) {
    console.error("[progression/leaderboard]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

module.exports = { getProgression, logExercice, leaderboard };
