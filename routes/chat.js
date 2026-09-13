const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authMiddleware } = require("../middlewares/auth");
const { chatLimiter } = require("../middlewares/rateLimit");

router.use(authMiddleware);

router.get("/welcome", chatLimiter, chatController.welcome);
router.post("/message", chatLimiter, chatController.sendMessage);
router.get("/history/:chapitre", chatController.getHistory);
router.delete("/history/:chapitre", chatController.clearHistory);

module.exports = router;
