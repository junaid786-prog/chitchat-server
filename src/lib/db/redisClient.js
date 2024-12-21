const { createClient } = require("redis");
const { CONFIG } = require("../../config/config");

const redisClient = createClient({
  url: CONFIG.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.connect();

module.exports = redisClient;
