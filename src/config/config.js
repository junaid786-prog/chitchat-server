require('dotenv').config();

const CONFIG = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/express-mongo',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
}


module.exports = { CONFIG };