// src/controllers/chat.controller.js
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const { CatchAsync } = require("../utils/CatchAsync");

const ChatController = {
  sendMessage: CatchAsync(async (req, res) => {
    const { chatId, content, replyTo } = req.body;

    if (!content) {
      return res.status(400).json({ status: "error", message: "Message content is required." });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ status: "error", message: "Chat not found." });
    }

    const message = new Message({
      chat: chatId,
      sender: req.user.id,
      content,
      replyTo,
    });

    await message.save();

    res.status(201).json({ status: "success", message });
  }),

  getChatHistory: CatchAsync(async (req, res) => {
    const { chatId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 }) // Retrieve the most recent messages first
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("sender", "username email")
      .populate("replyTo", "content sender");

    const totalMessages = await Message.countDocuments({ chat: chatId });

    res.status(200).json({
      status: "success",
      messages,
      total: totalMessages,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / limit),
    });
  }),
};

module.exports = ChatController;
