// src/models/chat.model.js
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 }); // Optimize participant lookups

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
