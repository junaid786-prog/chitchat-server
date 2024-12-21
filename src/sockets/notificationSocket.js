// src/sockets/notificationSocket.js
const Notification = require("../models/notification.model");

const notificationSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("sendNotification", async ({ userId, type, content }) => {
      const notification = new Notification({ user: userId, type, content });
      await notification.save();

      io.to(userId).emit("newNotification", notification);
      console.log(`Notification sent to user: ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = notificationSocket;
