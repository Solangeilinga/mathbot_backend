// lib/rag.js — Recherche vectorielle (RAG) sur les annales BEPC réelles indexées.
//
// Objectif : quand MathBot génère un exercice, on lui fournit en contexte des
// exercices RÉELLEMENT tirés des annales BEPC (indexés via scripts/indexAnnales.js)
// plutôt que de le laisser inventer librement. Il s'en inspire pour le style et
// le niveau, ce qui rend les exercices générés beaucoup plus fidèles au BEPC réel.
//
// ⚠️ Fonctionnalité dégradable : si l'extension PostgreSQL "pgvector" n'est pas
// installée, ou si GEMINI_API_KEY est absent, cette fonction échoue silencieusement
// (retourne []) et MathBot continue de fonctionner normalement, sans grounding RAG.

const { query } = require("./db");
const { getGeminiClient } = require("./ai");

// Le SDK @google/generative-ai (0.21.x) ne supporte pas ce modèle ni le
// paramètre outputDimensionality : appel REST direct, comme dans les scripts
// d'indexation (scripts/indexAnnales.js, scripts/indexRealAnnales.js), qui
// doivent rester alignés sur ce même modèle/dimension pour que les embeddings
// de requête et d'index soient comparables.
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIM = 768; // doit correspondre à annales_chunks.embedding vector(768)

async function embedText(text) {
  if (!getGeminiClient()) throw new Error("GEMINI_API_KEY requis pour les embeddings (RAG).");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: EMBEDDING_DIM,
      }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.embedding.values;
}

/**
 * Recherche les exercices d'annales les plus proches sémantiquement du
 * chapitre / message courant.
 * @returns {Promise<Array<{content:string, session:string, chapitre:string}>>}
 */
async function retrieveRelevantExercises({ chapitre, queryText, topK = 2 }) {
  try {
    const vec = await embedText(queryText || chapitre || "exercice de mathématiques BEPC");
    const vecLiteral = `[${vec.join(",")}]`;

    const rows = chapitre
      ? await query(
          `SELECT content, session, chapitre FROM annales_chunks
           WHERE chapitre = ? OR chapitre = 'Mixte'
           ORDER BY embedding <=> ?::vector LIMIT ?`,
          [chapitre, vecLiteral, topK]
        )
      : await query(
          `SELECT content, session, chapitre FROM annales_chunks
           ORDER BY embedding <=> ?::vector LIMIT ?`,
          [vecLiteral, topK]
        );

    return rows;
  } catch (err) {
    // Table absente (pgvector non installé), pas de clé Gemini, corpus vide, etc.
    console.warn("[rag] recherche indisponible :", err.message);
    return [];
  }
}

/** Formatte les extraits récupérés pour les injecter dans le prompt système. */
function formatRagContext(chunks) {
  if (!chunks?.length) return "";
  const items = chunks
    .map((c) => `[Extrait réel — session ${c.session}, chapitre ${c.chapitre}]\n${c.content}`)
    .join("\n\n");
  return `\n\n═══ EXERCICES RÉELS DES ANNALES BEPC ═══
Inspire-toi du STYLE, du NIVEAU DE DIFFICULTÉ et du VOCABULAIRE de ces vrais exercices d'annales pour générer les tiens. Ne les recopie jamais mot pour mot — adapte les nombres et le contexte.
${items}`;
}

module.exports = { embedText, retrieveRelevantExercises, formatRagContext };
