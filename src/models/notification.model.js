// src/models/notification.model.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Recipient
    type: { type: String, enum: ["message", "friendRequest", "match"], required: true },
    content: { type: String, required: true }, // Notification content
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 }); // Optimize unread notification lookups

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
