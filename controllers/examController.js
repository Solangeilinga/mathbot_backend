// controllers/examController.js
const { v4: uuidv4 } = require("uuid");
const { query, queryOne, run } = require("../lib/db");

async function saveResults(req, res) {
  const { chapitre, score, total, temps } = req.body;
  const userId = req.user.id;

  if (!chapitre || score === undefined || !total) {
    return res.status(400).json({ error: "Données d'examen incomplètes" });
  }

  const percentage = Math.round((score / total) * 100);

  try {
    const priorAttempts = await queryOne(
      "SELECT COUNT(*) as cnt FROM exam_results WHERE user_id = ? AND chapitre = ?",
      [userId, chapitre]
    );
    const isFirstAttempt = Number(priorAttempts?.cnt || 0) === 0;

    await run(
      `INSERT INTO exam_results (user_id, chapitre, score, total, percentage, temps_restant, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, chapitre, score, total, percentage, temps || 0]
    );

    // Alimente aussi la progression du chapitre (score/exercices/reussites) —
    // via un upsert car "Mixte" (examen blanc) n'a pas de ligne créée à l'inscription.
    await run(
      `INSERT INTO progression (id, user_id, chapitre, score, exercices, reussites, sessions)
       VALUES (?, ?, ?, ?, ?, ?, 1)
       ON CONFLICT (user_id, chapitre) DO UPDATE SET
         exercices = progression.exercices + EXCLUDED.exercices,
         reussites = progression.reussites + EXCLUDED.reussites,
         score = ROUND((progression.reussites + EXCLUDED.reussites) * 100.0 / NULLIF(progression.exercices + EXCLUDED.exercices, 0)),
         sessions = progression.sessions + 1,
         updated_at = NOW()`,
      [uuidv4(), userId, chapitre, percentage, total, score]
    );

    const isGoodScore = percentage >= 60;
    // Anti-abus : seule la première tentative d'un chapitre rapporte le plein XP,
    // pour éviter de refaire le même examen en boucle et farmer de l'XP à l'infini.
    const xpGagne = isFirstAttempt ? (isGoodScore ? 50 : 25) : (isGoodScore ? 10 : 5);

    const currentUser = await queryOne("SELECT xp, niveau FROM users WHERE id = ?", [userId]);
    const newXP = (currentUser?.xp || 0) + xpGagne;
    const newNiveau = Math.max(1, Math.floor(newXP / 100) + 1);

    await run("UPDATE users SET xp = ?, niveau = ?, updated_at = NOW() WHERE id = ?", [
      newXP,
      newNiveau,
      userId,
    ]);

    return res.json({
      message: `Examen terminé : ${percentage}% 🎉`,
      score: percentage,
      xpGagne,
      totalXP: newXP,
      niveau: newNiveau,
      verdict:
        percentage >= 80 ? "Excellent travail !" : percentage >= 60 ? "Bon effort, continue !" : "À retravailler",
    });
  } catch (err) {
    console.error("[exam/results]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function getHistory(req, res) {
  try {
    const results = await query(
      `SELECT chapitre, score, total, percentage, temps_restant, created_at
       FROM exam_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    return res.json({ history: results });
  } catch (err) {
    console.error("[exam/history]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function getHistoryByChapitre(req, res) {
  const chapitre = decodeURIComponent(req.params.chapitre);
  try {
    const results = await query(
      `SELECT chapitre, score, total, percentage, temps_restant, created_at
       FROM exam_results WHERE user_id = ? AND chapitre = ? ORDER BY created_at DESC LIMIT 20`,
      [req.user.id, chapitre]
    );
    return res.json({ history: results });
  } catch (err) {
    console.error("[exam/historyByChapitre]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function getStats(req, res) {
  const chapitre = decodeURIComponent(req.params.chapitre);
  try {
    const stats = await queryOne(
      `SELECT
         COUNT(*) as attempts,
         AVG(percentage) as "avgScore",
         MAX(percentage) as "bestScore",
         MIN(percentage) as "worstScore"
       FROM exam_results WHERE user_id = ? AND chapitre = ?`,
      [req.user.id, chapitre]
    );

    return res.json({
      chapter: chapitre,
      attempts: Number(stats?.attempts || 0),
      average: stats?.avgScore ? Math.round(stats.avgScore) : 0,
      best: stats?.bestScore || 0,
      worst: stats?.worstScore || 0,
    });
  } catch (err) {
    console.error("[exam/stats]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

module.exports = { saveResults, getHistory, getHistoryByChapitre, getStats };
