const redisClient = require("../lib/db/redisClient");
const Chat = require("../models/chat.model"); // Import Chat model

const matchmakingQueue = "waitingQueue";
const activeChatsKey = "activeChats";
const userSocketMap = {}; // Map userId to socketId

const matchmakingSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("findMatch", async ({ userId }) => {
      userSocketMap[userId] = socket.id;

      const queueMembers = await redisClient.lRange(matchmakingQueue, 0, -1);
      if (!queueMembers.includes(userId)) {
        await redisClient.rPush(matchmakingQueue, userId);
        console.log(`User added to queue: ${userId} (${socket.id})`);
      } else {
        console.log(`User ${userId} is already in the queue.`);
      }

      await matchUsers(io);
    });

    socket.on("skipChat", async ({ userId }) => {
      console.log(`User skipped chat: ${userId} (${socket.id})`);

      const chatPartner = await redisClient.get(`${activeChatsKey}:${userId}`);

      if (chatPartner) {
        await redisClient.del(`${activeChatsKey}:${userId}`);
        await redisClient.del(`${activeChatsKey}:${chatPartner}`);

        await redisClient.rPush(matchmakingQueue, chatPartner);
      }

      await redisClient.del(`${activeChatsKey}:${userId}`);
      await redisClient.lRem(matchmakingQueue, 0, userId);
      await redisClient.rPush(matchmakingQueue, userId);

      await matchUsers(io);
    });

    // When user disconnects
    socket.on("disconnect", async () => {
      try {
        const userId = Object.keys(userSocketMap).find((key) => userSocketMap[key] === socket.id);
        if (!userId) return;

        delete userSocketMap[userId];
        await redisClient.lRem(matchmakingQueue, 0, userId);

        const chatPartner = await redisClient.get(`${activeChatsKey}:${userId}`);
        if (chatPartner) {
          const partnerSocketId = userSocketMap[chatPartner];
          if (partnerSocketId) io.to(partnerSocketId).emit("chatEnded");

          await redisClient.del(`${activeChatsKey}:${userId}`);
          await redisClient.del(`${activeChatsKey}:${chatPartner}`);

          // Ensure the partner gets back into the queue
          await redisClient.rPush(matchmakingQueue, chatPartner);
        }

        console.log(`User disconnected: ${userId} (${socket.id})`);
      } catch (error) {
        console.error(`Error handling disconnect for ${socket.id}:`, error);
      }
    });
  });
};

// Matchmaking logic
const matchUsers = async (io) => {
  while ((await redisClient.lLen(matchmakingQueue)) >= 2) {
    const user1 = await redisClient.lPop(matchmakingQueue);
    const user2 = await redisClient.lPop(matchmakingQueue);

    if (!user1 || !user2) return; // Prevent undefined values from causing issues

    try {
      const chat = await Chat.create({ participants: [user1, user2], isAnonymous: true });

      await redisClient.set(`${activeChatsKey}:${user1}`, user2);
      await redisClient.set(`${activeChatsKey}:${user2}`, user1);

      const socketId1 = userSocketMap[user1];
      const socketId2 = userSocketMap[user2];

      if (socketId1) io.to(socketId1).emit("matchFound", { chatPartner: user2, chatId: chat._id });
      if (socketId2) io.to(socketId2).emit("matchFound", { chatPartner: user1, chatId: chat._id });

      console.log(`Match found: ${user1} (${socketId1}) and ${user2} (${socketId2}), Chat ID: ${chat._id}`);
    } catch (error) {
      console.error(`Error creating chat for ${user1} and ${user2}:`, error);

      if (user1) await redisClient.rPush(matchmakingQueue, user1);
      if (user2) await redisClient.rPush(matchmakingQueue, user2);
    }
  }
};

module.exports = matchmakingSocket;
