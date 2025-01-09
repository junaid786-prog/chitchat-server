// src/sockets/matchmakingSocket.js
const redisClient = require("../lib/db/redisClient");

const matchmakingQueue = "waitingQueue";
const activeChatsKey = "activeChats";

const matchmakingSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("findMatch", async () => {
      await redisClient.rPush(matchmakingQueue, socket.id);
      console.log(`User added to queue: ${socket.id}`);
      await matchUsers(io);
    });

    socket.on("skipChat", async () => {
      await redisClient.lRem(matchmakingQueue, 0, socket.id);
      await redisClient.del(`${activeChatsKey}:${socket.id}`);
      await redisClient.rPush(matchmakingQueue, socket.id);
      console.log(`User skipped chat: ${socket.id}`);
      await matchUsers(io);
    });

    socket.on("disconnect", async () => {
      try {
        await redisClient.lRem(matchmakingQueue, 0, socket.id);
    
        const chatPartner = await redisClient.get(`${activeChatsKey}:${socket.id}`);
        if (chatPartner) {
          io.to(chatPartner).emit("chatEnded");
    
          await redisClient.del(`${activeChatsKey}:${socket.id}`);
          await redisClient.del(`${activeChatsKey}:${chatPartner}`);
    
          await redisClient.rPush(matchmakingQueue, chatPartner);
    
          console.log(`Chat partner ${chatPartner} added back to the queue because ${socket.id} disconnected.`);
        }
    
        console.log(`User disconnected: ${socket.id}`);
      } catch (error) {
        console.error(`Error handling disconnect for ${socket.id}:`, error);
      }
    });
    
    
  });
};

const matchUsers = async (io) => {
  while ((await redisClient.lLen(matchmakingQueue)) >= 2) {
    // Pop two users from the queue individually
    const user1 = await redisClient.lPop(matchmakingQueue);
    const user2 = await redisClient.lPop(matchmakingQueue);



    if (user1 && user2) {
      // Save the chat pairing in Redis
      await redisClient.set(`${activeChatsKey}:${user1}`, user2);
      await redisClient.set(`${activeChatsKey}:${user2}`, user1);

      // Emit the 'matchFound' event with the socket IDs
      io.to(user1).emit("matchFound", { chatPartner: user2 });
      io.to(user2).emit("matchFound", { chatPartner: user1 });

      console.log(`Match found: ${user1} and ${user2}`);
    }
  }
};



module.exports = matchmakingSocket;
