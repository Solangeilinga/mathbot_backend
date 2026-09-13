// middlewares/rateLimit.js — Limiteurs de débit par route (express-rate-limit)
//
// ⚠️ Limitation connue : le magasin par défaut d'express-rate-limit vit en
// mémoire du process. Sur un déploiement multi-instances (plusieurs conteneurs
// derrière un load balancer), chaque instance a son propre compteur — la
// limite globale n'est donc qu'approximative. Pour une limite stricte en
// production distribuée, utilisez un store partagé (ex. rate-limit-redis).

const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, réessaie plus tard." },
});

const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de messages, réessaie dans quelques minutes." },
});

const ttsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes TTS." },
});

module.exports = { authLimiter, chatLimiter, ttsLimiter };
