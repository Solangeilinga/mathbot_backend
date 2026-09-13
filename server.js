// server.js — Point d'entrée du backend MathBot (Express + PostgreSQL)
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const memoryRoutes = require("./routes/memory");
const ttsRoutes = require("./routes/tts");
const progressionRoutes = require("./routes/progression");
const examRoutes = require("./routes/exam");
const subjectRoutes = require("./routes/subject");
const exerciseRoutes = require("./routes/exercise");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Sécurité & CORS ──────────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Autorise les requêtes sans origine (ex. curl, apps mobiles) et les origines listées
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Non autorisé par CORS."));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "15mb" })); // limite généreuse pour les images d'exercices en base64

// ── Routes ───────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/memory", memoryRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/progression", progressionRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/exercise", exerciseRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route introuvable." }));

// ── Gestionnaire d'erreurs global ───────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message === "Non autorisé par CORS.") {
    return res.status(403).json({ error: err.message });
  }
  console.error("❌ Erreur non gérée :", err);
  const isDev = process.env.NODE_ENV !== "production";
  return res.status(500).json({ error: isDev ? err.message : "Erreur serveur." });
});

app.listen(PORT, () => {
  console.log(`🦉 MathBot API en écoute sur http://localhost:${PORT}`);
});
