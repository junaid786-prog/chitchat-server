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
      await redisClient.lRem(matchmakingQueue, 0, socket.id);
      const chatPartner = await redisClient.get(`${activeChatsKey}:${socket.id}`);
      if (chatPartner) {
        io.to(chatPartner).emit("chatEnded");
        await redisClient.del(`${activeChatsKey}:${chatPartner}`);
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

const matchUsers = async (io) => {
  while ((await redisClient.lLen(matchmakingQueue)) >= 2) {
    const [user1, user2] = await redisClient.lpop(matchmakingQueue, 2);

    if (user1 && user2) {
      await redisClient.set(`${activeChatsKey}:${user1}`, user2);
      await redisClient.set(`${activeChatsKey}:${user2}`, user1);

      io.to(user1).emit("matchFound", { chatPartner: user2 });
      io.to(user2).emit("matchFound", { chatPartner: user1 });

      console.log(`Match found: ${user1} and ${user2}`);
    }
  }
};

module.exports = matchmakingSocket;
