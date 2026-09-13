// middlewares/auth.js — Authentification JWT réelle pour les routes Express.
//
// ⚠️ CORRECTIF IMPORTANT par rapport à l'ancien backend : l'ancien
// `middlewares/auth.js` ne vérifiait aucun token et renvoyait toujours un
// utilisateur fixe ("dev-user-id"). Ici, le token JWT envoyé par le client
// est réellement vérifié — chaque élève est bien isolé des autres.

const jwt = require("jsonwebtoken");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token manquant." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }
}

module.exports = { authMiddleware, signToken };
