-- db/schema.sql — Schéma PostgreSQL pour MathBot BEPC
-- Conversion depuis le schéma MySQL d'origine.

-- ── Fonction générique pour auto-mettre à jour "updated_at" ───────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── users ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  TEXT PRIMARY KEY,
  nom                 VARCHAR(100) NOT NULL,
  prenom              VARCHAR(100) NOT NULL,
  email               VARCHAR(255) UNIQUE NOT NULL,
  password            VARCHAR(255) NOT NULL,
  xp                  INTEGER      DEFAULT 0,
  niveau              INTEGER      DEFAULT 1,
  profil_pedagogique  TEXT         DEFAULT NULL,
  profil_updated_at   TIMESTAMP    DEFAULT NULL,
  created_at          TIMESTAMP    DEFAULT NOW(),
  updated_at          TIMESTAMP    DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── progression ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progression (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapitre   VARCHAR(100) NOT NULL,
  score      INTEGER DEFAULT 0,
  sessions   INTEGER DEFAULT 0,
  exercices  INTEGER DEFAULT 0,
  reussites  INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, chapitre)
);

DROP TRIGGER IF EXISTS trg_progression_updated_at ON progression;
CREATE TRIGGER trg_progression_updated_at
  BEFORE UPDATE ON progression
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── conversation_history ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_history (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapitre   VARCHAR(100) NOT NULL,
  role       VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conv_user_chapitre ON conversation_history (user_id, chapitre);

-- ── exercices_log ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercices_log (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapitre   VARCHAR(100) NOT NULL,
  correct    BOOLEAN NOT NULL,
  xp_gagne   INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── exam_results ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_results (
  id            BIGSERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapitre      VARCHAR(100) NOT NULL,
  score         INTEGER NOT NULL,
  total         INTEGER NOT NULL,
  percentage    INTEGER NOT NULL,
  temps_restant INTEGER DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_exam_user_chapitre ON exam_results (user_id, chapitre);

-- ── exam_subjects ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_subjects (
  id         BIGSERIAL PRIMARY KEY,
  session    VARCHAR(50) NOT NULL,
  chapitre   VARCHAR(100) NOT NULL,
  sujet      TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (session, chapitre)
);
