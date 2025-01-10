// src/routes/chat.route.js
const express = require("express");
const ChatController = require("../controllers/chat.controller");
const { authenticate } = require("../middelwares/auth");

const router = express.Router();

router.post("/message", authenticate, ChatController.sendMessage);
router.get("/:chatId/messages", authenticate, ChatController.getChatHistory);
router.post("/create", authenticate, ChatController.createChat);
router.get("/list", authenticate, ChatController.getChatsByUser);

module.exports = router;
