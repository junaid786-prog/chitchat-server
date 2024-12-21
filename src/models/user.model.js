// src/models/user.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true }, // Optional for registered users
    email: { type: String, unique: true, sparse: true }, // Only for registered users
    password: { type: String }, // Only for registered users
    isAnonymous: { type: Boolean, default: false }, // For anonymous users
    premium: { type: Boolean, default: false }, // For premium features
    role: { type: String, enum: ["User", "Admin"], default: "User" }, // Role-based access
  },
  { timestamps: true }
);

// Pre-save hook for password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
