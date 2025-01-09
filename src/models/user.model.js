// src/models/user.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    isAnonymous: { type: Boolean, default: false },
    allowFriendRequest: { type: Boolean, default: false },
    notificationSound: { type: Boolean, default: false },
    pushNotification: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    gender: { type: String, enum: [0, 1, 2], default: 0 },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    usernameChanges: { type: Number, default: 0 },
    lastUsernameReset: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.canUpdateUsername = function () {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const now = new Date();

  if (now - this.lastUsernameReset > ONE_DAY) {
    this.usernameChanges = 0;
    this.lastUsernameReset = now;
  }

  return this.usernameChanges < 3;
};

userSchema.methods.updateUsername = async function (newUsername) {
  if (!this.canUpdateUsername()) {
  throw new Error("You have reached the limit of 3 username changes for today.")
  }

  this.username = newUsername;
  this.usernameChanges += 1;
  await this.save();
};

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
