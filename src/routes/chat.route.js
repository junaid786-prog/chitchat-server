// src/routes/chat.route.js
const express = require("express");
const ChatController = require("../controllers/chat.controller");
const { authenticate } = require("../middelwares/auth");

const router = express.Router();

router.post("/message", authenticate, ChatController.sendMessage);
router.get("/history/:chatId", authenticate, ChatController.getChatHistory);

module.exports = router;
