// controllers/subjectController.js
const { query, queryOne } = require("../lib/db");
const { completeChat } = require("../lib/ai");
const { CORRECTION_SYSTEM_PROMPT } = require("../lib/prompts");

async function listSessions(req, res) {
  try {
    const sessions = await query("SELECT DISTINCT session FROM exam_subjects ORDER BY session DESC");
    return res.json({ sessions: sessions.map((s) => s.session) });
  } catch (err) {
    console.error("[subject/listSessions]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function listSubjectsBySession(req, res) {
  const session = decodeURIComponent(req.params.session);
  try {
    const subjects = await query(
      "SELECT id, session, chapitre FROM exam_subjects WHERE session = ? ORDER BY chapitre",
      [session]
    );
    return res.json({ subjects });
  } catch (err) {
    console.error("[subject/listBySession]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function getSubject(req, res) {
  const session = decodeURIComponent(req.params.session);
  const chapitre = decodeURIComponent(req.params.chapitre);
  try {
    const subject = await queryOne(
      "SELECT id, session, chapitre, sujet FROM exam_subjects WHERE session = ? AND chapitre = ?",
      [session, chapitre]
    );
    if (!subject) {
      return res.status(404).json({ error: `Sujet introuvable (session: ${session}, chapitre: ${chapitre})` });
    }
    return res.json(subject);
  } catch (err) {
    console.error("[subject/get]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function correctSubject(req, res) {
  const { sujet, reponses } = req.body;
  if (!sujet || !reponses) {
    return res.status(400).json({ error: "Sujet et réponses requis" });
  }

  try {
    const userMsg = `SUJET :\n${sujet}\n\nRÉPONSES DE L'ÉLÈVE :\n${reponses}\n\nCorrige et note ce travail.`;
    const correction = await completeChat({
      systemPrompt: CORRECTION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
      maxTokens: 1000,
      temperature: 0.7,
    });

    const noteMatch = correction.match(/(\d+(?:[.,]\d+)?)\s*\/\s*20/);
    const note = noteMatch ? parseFloat(noteMatch[1].replace(",", ".")) : 10;

    return res.json({ note, correction, percentage: Math.round((note / 20) * 100) });
  } catch (err) {
    console.error("[subject/correct]", err.message);
    return res.status(502).json({ error: "Erreur IA lors de la correction" });
  }
}

module.exports = { listSessions, listSubjectsBySession, getSubject, correctSubject };
