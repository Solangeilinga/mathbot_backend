// controllers/memoryController.js
const { queryOne } = require("../lib/db");
const { generateMemory } = require("../lib/memory");

async function getMemory(req, res) {
  try {
    const user = await queryOne(
      "SELECT profil_pedagogique, profil_updated_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!user?.profil_pedagogique) {
      return res.json({ profil: null, message: "Pas encore de profil — continue tes sessions !" });
    }
    return res.json({
      profil: JSON.parse(user.profil_pedagogique),
      updated_at: user.profil_updated_at,
    });
  } catch (err) {
    console.error("[memory/get]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function updateMemory(req, res) {
  const { chapitre } = req.body;
  if (!chapitre) return res.status(400).json({ error: "chapitre requis." });

  try {
    const profil = await generateMemory(req.user.id, chapitre);
    if (!profil) {
      return res.json({ message: "Pas assez d'échanges pour générer un profil.", profil: null });
    }
    return res.json({ message: "Profil mis à jour !", profil });
  } catch (err) {
    console.error("[memory/update]", err.message);
    return res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
  }
}

module.exports = { getMemory, updateMemory };
