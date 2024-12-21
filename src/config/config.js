require('dotenv').config();

const CONFIG = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/express-mongo',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development'
}

module.exports = { CONFIG };