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

  updateMessage: CatchAsync(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ status: "error", message: "Message content is required." });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ status: "error", message: "Message not found." });
    }

    message.content = content;
    await message.save();

    res.status(200).json({ status: "success", message });
  }),

  deleteMessage: CatchAsync(async (req, res) => {
    const { messageId } = req.params;

    const message = await Message.deleteOne({
      _id: messageId,
      sender: req.user.id,
    });

    if (message.deletedCount === 0) {
      return res.status(404).json({ status: "error", message: "Message not found." });
    }

    res.status(204).json({
      status: "success",
      message: "Message deleted successfully"
    });
  }),

  getChatHistory: CatchAsync(async (req, res) => {
    const { chatId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const chat = await Chat.findById(chatId)
      .populate("participants", "username")
    if (!chat) {
      return res.status(404).json({ status: "error", message: "Chat not found." });
    }

    const messages = await Message.find({ chat: chatId })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("sender", "username email")
      .populate("replyTo", "content sender");

    const totalMessages = await Message.countDocuments({ chat: chatId });

    res.status(200).json({
      status: "success",
      messages,
      chat: chat.toObject(),
      total: totalMessages,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / limit),
    });
  }),

  createChat: CatchAsync(async (req, res) => {
    const { participants } = req.body;

    if (!participants || participants.length < 2) {
      return res.status(400).json({ status: "error", message: "Participants are required." });
    }

    const chat = await Chat.create({ participants });

    res.status(201).json({ status: "success", chat });
  }),

  getChatsByUser: CatchAsync(async (req, res) => {
    const userId = req.user.id;

    const chats = await Chat.find({
      participants: userId,
    }).populate("participants", "username");

    const filteredChats = chats.map(chat => ({
      ...chat.toObject(),
      participants: chat.participants.filter(participant => participant._id.toString() !== userId),
    }));

    res.status(200).json({ status: "success", chats: filteredChats });
  }),


};

module.exports = ChatController;
