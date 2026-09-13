// db/init.js — Applique le schéma PostgreSQL (idempotent, "CREATE TABLE IF NOT EXISTS")
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function init() {
  console.log("🔧 Initialisation de la base PostgreSQL...");

  const connectionString = process.env.DATABASE_URL;
  const ssl = process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false;

  const pool = connectionString
    ? new Pool({ connectionString, ssl })
    : new Pool({
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "postgres",
        database: process.env.PGDATABASE || "bepcmath",
        ssl,
      });

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

  try {
    await pool.query(schema);
    console.log("✅ Tables PostgreSQL prêtes !");
  } catch (err) {
    console.error("❌ Erreur init PostgreSQL :", err.message);
    process.exitCode = 1;
    await pool.end();
    return;
  }

  // ── Schéma optionnel : recherche vectorielle (RAG) sur les annales ─────────
  // N'interrompt pas l'initialisation si pgvector n'est pas disponible.
  try {
    const ragSchema = fs.readFileSync(path.join(__dirname, "schema.rag.sql"), "utf8");
    await pool.query(ragSchema);
    console.log("✅ Extension RAG (pgvector) prête — les annales pourront être indexées.");
  } catch (err) {
    console.warn(
      "⚠️  Extension RAG non installée (pgvector absent ou permissions insuffisantes) :",
      err.message
    );
    console.warn("   → MathBot fonctionnera normalement, sans grounding sur les annales réelles.");
    console.warn("   → Voir README.md, section RAG, pour l'activer plus tard.");
  }

  await pool.end();
}

if (require.main === module) {
  init();
}

module.exports = { init };
