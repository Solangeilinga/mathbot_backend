const express = require("express");
const router = express.Router();
const ttsController = require("../controllers/ttsController");
const { authMiddleware } = require("../middlewares/auth");
const { ttsLimiter } = require("../middlewares/rateLimit");

router.post("/", authMiddleware, ttsLimiter, ttsController.synthesize);

module.exports = router;
