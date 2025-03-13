// src/sockets/chatSocket.js
const redisClient = require("../lib/db/redisClient");
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const matchmakingQueue = "waitingQueue";
const activeChatsKey = "activeChats";
const userSocketMap = {}; // Map userId to socketId
const chatSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join_chat", async ({ chatId }) => {
      console.log('user joined', chatId)
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on("send_message", async ({ chatId, content, senderId, replyTo }) => {
      if (!content) return;


      const message = new Message({
        chat: chatId,
        sender: senderId,
        content,
        replyTo,
      });

      await message.save();

      let messageToSend = await message.populate("sender", "username email")
      socket.broadcast.to(chatId).emit("new_message", messageToSend);

      console.log(`Message sent in chat: ${chatId}`);
    });

    socket.on("leave_chat", async ({ chatId, userId }) => {
      try {
        socket.leave(chatId);
        console.log(`User ${userId} left chat: ${chatId}`);

        const chatPartner = await redisClient.get(`${activeChatsKey}:${userId}`);
        if (chatPartner) {
          const partnerSocketId = userSocketMap[chatPartner];
          if (partnerSocketId) {
            io.to(partnerSocketId).emit("chatEnded", { message: "Your chat partner has left the chat." });
          }

          await redisClient.del(`${activeChatsKey}:${userId}`);
          await redisClient.del(`${activeChatsKey}:${chatPartner}`);

          await redisClient.rPush(matchmakingQueue, chatPartner);

          console.log(`Chat partner ${chatPartner} re-added to queue because ${userId} left the chat.`);
        }
      } catch (error) {
        console.error(`Error handling leave_chat for chatId ${chatId} and userId ${userId}:`, error);
      }
    });


    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = chatSocket;
