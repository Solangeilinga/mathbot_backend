const express = require("express");
const router = express.Router();
const exerciseController = require("../controllers/exerciseController");
const { authMiddleware } = require("../middlewares/auth");

router.post("/analyze", authMiddleware, exerciseController.analyze);

module.exports = router;
