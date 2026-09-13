// lib/db.js — Connexion PostgreSQL (pool partagé) + helpers de requête
const { Pool } = require("pg");

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
      max: 10,
    });

pool.on("error", (err) => {
  console.error("❌ Erreur inattendue du pool PostgreSQL :", err.message);
});

// Convertit les placeholders "?" (héritage MySQL) en $1, $2, ... (PostgreSQL)
function toPgSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

/** Exécute une requête et retourne toutes les lignes. */
async function query(sql, params = []) {
  try {
    const res = await pool.query(toPgSql(sql), params);
    return res.rows;
  } catch (err) {
    console.error("❌ Erreur SQL (query):", err.message, "\n  SQL:", sql);
    throw err;
  }
}

/** Exécute une requête et retourne la première ligne (ou undefined). */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0];
}

/**
 * Exécute une requête d'écriture (INSERT/UPDATE/DELETE).
 * Pour un INSERT, ajoute automatiquement RETURNING id si absent afin de
 * pouvoir renvoyer lastID (compatibilité avec l'ancien code MySQL).
 */
async function run(sql, params = []) {
  try {
    let finalSql = sql;
    const isInsert = /^\s*insert/i.test(sql);
    if (isInsert && !/returning/i.test(sql)) {
      finalSql = `${sql} RETURNING id`;
    }
    const res = await pool.query(toPgSql(finalSql), params);
    return {
      changes: res.rowCount,
      lastID: res.rows?.[0]?.id ?? null,
    };
  } catch (err) {
    console.error("❌ Erreur SQL (run):", err.message, "\n  SQL:", sql);
    throw err;
  }
}

module.exports = { pool, query, queryOne, run };
