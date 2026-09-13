const express = require("express");
const router = express.Router();
const progressionController = require("../controllers/progressionController");
const { authMiddleware } = require("../middlewares/auth");

router.use(authMiddleware);

router.get("/", progressionController.getProgression);
router.post("/exercice", progressionController.logExercice);
router.get("/leaderboard", progressionController.leaderboard);

module.exports = router;
