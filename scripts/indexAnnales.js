// scripts/indexAnnales.js — Indexe les sujets d'annales (table exam_subjects) pour le RAG.
//
// Découpe chaque sujet en morceaux (un par "EXERCICE N :"), calcule un embedding
// Gemini (text-embedding-004) pour chacun, et les stocke dans annales_chunks.
// Relance ce script à chaque fois que vous ajoutez de nouvelles annales réelles
// via `db.exam_subjects` (voir scripts/insertTestSubject.js pour un exemple).
//
// Prérequis : GEMINI_API_KEY dans .env.local, et le schéma RAG appliqué
// (npm run db:init l'applique automatiquement si pgvector est disponible).

require("dotenv").config();
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

// Découpe un sujet complet en un chunk par "EXERCICE N :" (unité sémantique cohérente)
function splitIntoExerciseChunks(sujetText) {
  const parts = sujetText
    .split(/(?=EXERCICE\s+\d+\s*:)/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.filter((p) => /^EXERCICE\s+\d+/i.test(p));
}

async function indexAll() {
  console.log("📚 Indexation des annales BEPC pour le RAG...\n");

  let subjects;
  try {
    subjects = await pool.query("SELECT session, chapitre, sujet FROM exam_subjects");
  } catch (err) {
    console.error("❌ Impossible de lire exam_subjects :", err.message);
    process.exitCode = 1;
    await pool.end();
    return;
  }

  if (subjects.rows.length === 0) {
    console.log("⚠️  Aucun sujet dans exam_subjects. Lancez d'abord : npm run db:seed");
    await pool.end();
    return;
  }

  let totalChunks = 0;

  for (const row of subjects.rows) {
    const chunks = splitIntoExerciseChunks(row.sujet);
    if (!chunks.length) {
      console.log(`⚠️  Aucun "EXERCICE N :" détecté dans ${row.session}/${row.chapitre} — ignoré.`);
      continue;
    }

    try {
      // Ré-indexation propre : on retire les anciens chunks de ce sujet avant de réinsérer
      await pool.query("DELETE FROM annales_chunks WHERE session = $1 AND chapitre = $2", [
        row.session,
        row.chapitre,
      ]);

      for (const chunk of chunks) {
        const vec = await embed(chunk);
        await pool.query(
          `INSERT INTO annales_chunks (session, chapitre, content, embedding)
           VALUES ($1, $2, $3, $4::vector)`,
          [row.session, row.chapitre, chunk, `[${vec.join(",")}]`]
        );
      }

      console.log(`✅ ${chunks.length} exercice(s) indexé(s) pour ${row.session} / ${row.chapitre}`);
      totalChunks += chunks.length;
    } catch (err) {
      console.error(
        `❌ Échec d'indexation pour ${row.session}/${row.chapitre} :`,
        err.message,
        err.message.includes("annales_chunks") ? "\n   → Le schéma RAG (pgvector) est-il installé ? Lancez : npm run db:init" : ""
      );
    }
  }

  console.log(`\n🎉 Terminé : ${totalChunks} extrait(s) indexé(s) au total.`);
  await pool.end();
}

indexAll().catch(async (err) => {
  console.error("❌ Erreur fatale :", err.message);
  await pool.end();
  process.exitCode = 1;
});
