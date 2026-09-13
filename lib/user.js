// lib/user.js — Helpers utilisateur partagés entre routes
const { queryOne } = require("./db");

async function resolvePrenom(userId, authUser) {
  try {
    const dbUser = await queryOne("SELECT prenom, nom FROM users WHERE id = ?", [userId]);
    if (dbUser?.prenom && dbUser.prenom !== "undefined") {
      return { prenom: dbUser.prenom, nom: dbUser.nom };
    }
  } catch {
    /* fallback ci-dessous */
  }
  if (authUser?.prenom && authUser.prenom !== "undefined") {
    return { prenom: authUser.prenom, nom: authUser.nom };
  }
  return { prenom: "toi", nom: "" };
}

module.exports = { resolvePrenom };
