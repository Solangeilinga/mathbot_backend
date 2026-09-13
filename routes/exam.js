const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const { authMiddleware } = require("../middlewares/auth");

router.use(authMiddleware);

router.post("/results", examController.saveResults);
router.get("/history", examController.getHistory);
router.get("/history/:chapitre", examController.getHistoryByChapitre);
router.get("/stats/:chapitre", examController.getStats);

module.exports = router;
