-- db/schema.rag.sql — Extension OPTIONNELLE : recherche vectorielle (RAG) sur les annales BEPC
--
-- Nécessite l'extension PostgreSQL "pgvector" installée sur le serveur
-- (disponible nativement sur Supabase, Neon, Render Postgres... ; sur un
-- PostgreSQL auto-hébergé, voir https://github.com/pgvector/pgvector#installation).
--
-- Ce fichier est appliqué séparément de schema.sql par db/init.js, dans un
-- try/catch : s'il échoue (pgvector absent), l'application continue de
-- fonctionner normalement — la fonctionnalité RAG est simplement désactivée
-- (lib/rag.js retombe alors sur un tableau vide).

CREATE EXTENSION IF NOT EXISTS vector;

-- text-embedding-004 (Gemini) produit des vecteurs de dimension 768.
CREATE TABLE IF NOT EXISTS annales_chunks (
  id         BIGSERIAL PRIMARY KEY,
  session    VARCHAR(50) NOT NULL,
  chapitre   VARCHAR(100) NOT NULL,
  content    TEXT NOT NULL,
  embedding  vector(768),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annales_chunks_chapitre ON annales_chunks (chapitre);

-- Pour un gros corpus (des centaines de chunks et plus), ajoutez un index
-- approximatif pour accélérer la recherche par similarité :
--
-- CREATE INDEX idx_annales_chunks_embedding
--   ON annales_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
--
-- Non créé par défaut : avec un petit corpus (quelques dizaines de chunks),
-- une recherche séquentielle (sans index) est déjà largement suffisante.
