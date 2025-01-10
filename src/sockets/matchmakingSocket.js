const redisClient = require("../lib/db/redisClient");
const Chat = require("../models/chat.model"); // Import Chat model

const matchmakingQueue = "waitingQueue";
const activeChatsKey = "activeChats";
const userSocketMap = {}; // Map userId to socketId

const matchmakingSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When user requests to find a match
    socket.on("findMatch", async ({ userId }) => {
      // Map userId to socketId for later use
      userSocketMap[userId] = socket.id;

      // Add the userId to the matchmaking queue
      await redisClient.rPush(matchmakingQueue, userId);
      console.log(`User added to queue: ${userId} (${socket.id})`);

      // Attempt to match users
      await matchUsers(io);
    });

    // When user skips the current chat
    socket.on("skipChat", async ({ userId }) => {
      await redisClient.lRem(matchmakingQueue, 0, userId);
      await redisClient.del(`${activeChatsKey}:${userId}`);
      await redisClient.rPush(matchmakingQueue, userId);
      console.log(`User skipped chat: ${userId} (${socket.id})`);
      await matchUsers(io);
    });

    // When user disconnects
    socket.on("disconnect", async () => {
      try {
        const userId = Object.keys(userSocketMap).find((key) => userSocketMap[key] === socket.id);
        if (!userId) return;

        delete userSocketMap[userId]; // Remove from mapping
        await redisClient.lRem(matchmakingQueue, 0, userId);

        const chatPartner = await redisClient.get(`${activeChatsKey}:${userId}`);
        if (chatPartner) {
          const partnerSocketId = userSocketMap[chatPartner];
          if (partnerSocketId) io.to(partnerSocketId).emit("chatEnded");

          await redisClient.del(`${activeChatsKey}:${userId}`);
          await redisClient.del(`${activeChatsKey}:${chatPartner}`);
          await redisClient.rPush(matchmakingQueue, chatPartner);

          console.log(`Chat partner ${chatPartner} re-added to queue because ${userId} disconnected.`);
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

    if (user1 && user2) {
      try {
        // Create a new chat document
        const chat = await Chat.create({
          participants: [user1, user2],
          isAnonymous: true, // Adjust based on your requirements
        });

        // Save the chat pairing in Redis
        await redisClient.set(`${activeChatsKey}:${user1}`, user2);
        await redisClient.set(`${activeChatsKey}:${user2}`, user1);

        // Find their socket IDs
        const socketId1 = userSocketMap[user1];
        const socketId2 = userSocketMap[user2];

        // Emit 'matchFound' with chat ID and chat partner info
        if (socketId1) io.to(socketId1).emit("matchFound", { chatPartner: user2, chatId: chat._id });
        if (socketId2) io.to(socketId2).emit("matchFound", { chatPartner: user1, chatId: chat._id });

        console.log(`Match found: ${user1} (${socketId1}) and ${user2} (${socketId2}), Chat ID: ${chat._id}`);
      } catch (error) {
        console.error(`Error creating chat for ${user1} and ${user2}:`, error);

        // Re-add users to the queue in case of error
        if (user1) await redisClient.rPush(matchmakingQueue, user1);
        if (user2) await redisClient.rPush(matchmakingQueue, user2);
      }
    }
  }
};

module.exports = matchmakingSocket;
