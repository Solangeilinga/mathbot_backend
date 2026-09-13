// scripts/indexRealAnnales.js — Indexe le corpus de vraies annales BEPC
// (data/annales-corpus.js) dans annales_chunks pour le RAG.
//
// Différence avec scripts/indexAnnales.js : celui-ci indexe des chunks déjà
// délimités et étiquetés PAR EXERCICE (un vrai chapitre par chunk), au lieu de
// découper un sujet entier tagué d'un seul chapitre ("Mixte"). C'est ce
// découpage fin qui rend le filtre par chapitre de lib/rag.js réellement utile.
//
// Prérequis : GEMINI_API_KEY dans .env, schéma RAG appliqué (npm run db:init).

require("dotenv").config();
const { Pool } = require("pg");
const { CORPUS } = require("../data/annales-corpus");

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

async function embed(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquant — requis pour indexer les annales (RAG).");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        outputDimensionality: 768, // doit correspondre à annales_chunks.embedding vector(768)
      }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.embedding.values;
}

async function indexRealAnnales() {
  console.log(`📚 Indexation de ${CORPUS.length} exercices réels (annales BEPC)...\n`);

  const sessions = [...new Set(CORPUS.map((c) => c.session))];
  for (const session of sessions) {
    await pool.query("DELETE FROM annales_chunks WHERE session = $1", [session]);
  }
  console.log(`🧹 Anciens chunks des sessions [${sessions.join(", ")}] retirés (ré-indexation propre).\n`);

  const parChapitre = {};
  let done = 0;

  for (const item of CORPUS) {
    try {
      const vec = await embed(item.content);
      await pool.query(
        `INSERT INTO annales_chunks (session, chapitre, content, embedding)
         VALUES ($1, $2, $3, $4::vector)`,
        [item.session, item.chapitre, item.content, `[${vec.join(",")}]`]
      );
      parChapitre[item.chapitre] = (parChapitre[item.chapitre] || 0) + 1;
      done++;
      process.stdout.write(`  ✅ [${item.session}] ${item.chapitre}\n`);
    } catch (err) {
      console.error(`  ❌ Échec pour un exercice [${item.session}/${item.chapitre}] :`, err.message);
    }
  }

  console.log(`\n🎉 ${done}/${CORPUS.length} exercices indexés.`);
  console.log("Répartition par chapitre :", parChapitre);
  await pool.end();
}

indexRealAnnales().catch(async (err) => {
  console.error("❌ Erreur fatale :", err.message);
  await pool.end();
  process.exitCode = 1;
});
