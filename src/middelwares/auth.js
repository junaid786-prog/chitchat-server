// src/middelwares/auth.js
const { verifyToken } = require("../utils/tokens");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }
};

module.exports = { authenticate };
