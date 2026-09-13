const express = require("express");
const router = express.Router();
const memoryController = require("../controllers/memoryController");
const { authMiddleware } = require("../middlewares/auth");

router.use(authMiddleware);

router.get("/", memoryController.getMemory);
router.post("/update", memoryController.updateMemory);

module.exports = router;
