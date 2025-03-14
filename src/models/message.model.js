// src/models/message.model.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    file: {
      name: { type: String },
      url: { type: String },
      type: { type: String },
    },
    emoji: {
      type: String
    },
    reactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: 1 }); // Optimize history retrieval

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
