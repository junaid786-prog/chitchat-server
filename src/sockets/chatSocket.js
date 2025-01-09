// src/sockets/chatSocket.js
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinChat", async ({ chatId }) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on("send_message", async ({ chatId, content, senderId, replyTo }) => {
      if (!content) return;

      console.log(' chatId, content, senderId, replyTo', chatId, content, senderId, replyTo)
      const message = new Message({
        chat: chatId,
        sender: senderId,
        content,
        replyTo,
      });

      await message.save();

      io.to(chatId).emit("new_message", {
        message: await message.populate("sender", "username email").execPopulate(),
      });

      console.log(`Message sent in chat: ${chatId}`);
    });

    socket.on("leaveChat", ({ chatId }) => {
      socket.leave(chatId);
      console.log(`User left chat: ${chatId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = chatSocket;
