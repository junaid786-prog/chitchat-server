// src/models/user.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    isAnonymous: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    gender: { type: String, enum: [0, 1, 2], default: 0 }, // 0: Not specified, 1: Male, 2: Female
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
