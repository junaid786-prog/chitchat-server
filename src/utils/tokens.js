// src/utils/tokens.js
const jwt = require("jsonwebtoken");
const { CONFIG } = require("../config/config");

const generateToken = (user) => {
  const secret = CONFIG.JWT_SECRET || "secret";
  const expiresIn = CONFIG.JWT_EXPIRES_IN || "1d";
  return jwt.sign(
    { id: user._id, isAnonymous: user.isAnonymous, role: user.role },
    secret,
    { expiresIn }
  );
};

const verifyToken = (token) => {
  const secret = CONFIG.JWT_SECRET || "secret";
  const result= jwt.verify(token, secret);
  return result;
};

module.exports = { generateToken, verifyToken };
