// controllers/authController.js
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { queryOne, run } = require("../lib/db");
const { signToken } = require("../middlewares/auth");

const CHAPITRES = ["Probabilités", "Géométrie", "Algèbre", "Fonctions", "Statistiques", "Trigonométrie"];

async function register(req, res) {
  const { nom, prenom, email, password } = req.body;
  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Mot de passe trop court (min 6 caractères)." });
  }

  try {
    const existing = await queryOne("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) return res.status(409).json({ error: "Cet email est déjà utilisé." });

    const hash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await run("INSERT INTO users (id, nom, prenom, email, password) VALUES (?, ?, ?, ?, ?)", [
      userId,
      nom,
      prenom,
      email,
      hash,
    ]);

    for (const ch of CHAPITRES) {
      await run(
        "INSERT INTO progression (id, user_id, chapitre) VALUES (?, ?, ?) ON CONFLICT (user_id, chapitre) DO NOTHING",
        [uuidv4(), userId, ch]
      );
    }

    const token = signToken({ id: userId, email, nom, prenom });
    return res.status(201).json({
      message: "Compte créé !",
      token,
      user: { id: userId, nom, prenom, email, xp: 0, niveau: 1 },
    });
  } catch (err) {
    console.error("[auth/register]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  try {
    const user = await queryOne("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Email ou mot de passe incorrect." });

    const token = signToken({ id: user.id, email: user.email, nom: user.nom, prenom: user.prenom });
    return res.json({
      message: "Connexion réussie !",
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        xp: user.xp,
        niveau: user.niveau,
      },
    });
  } catch (err) {
    console.error("[auth/login]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function me(req, res) {
  try {
    const user = await queryOne("SELECT id, nom, prenom, email, xp, niveau FROM users WHERE id = ?", [
      req.user.id,
    ]);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    return res.json({ user });
  } catch (err) {
    console.error("[auth/me]", err.message);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

module.exports = { register, login, me };
