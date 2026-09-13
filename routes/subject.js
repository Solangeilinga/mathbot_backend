const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");
const { authMiddleware } = require("../middlewares/auth");

// ⚠️ Ordre important : les routes fixes ("/sessions", "/correct") doivent être
// déclarées AVANT les routes à paramètres ("/:session", "/:session/:chapitre"),
// sinon Express les interpréterait comme des noms de session.
router.get("/sessions", subjectController.listSessions);
router.post("/correct", authMiddleware, subjectController.correctSubject);
router.get("/:session/:chapitre", authMiddleware, subjectController.getSubject);
router.get("/:session", subjectController.listSubjectsBySession);

module.exports = router;
