const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    let secret = process.env.JWT_SECRET || "secret";
    let expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    return jwt.sign({ id: user._id, role: user?.role, vendor: user?.vendor }, secret, {
        expiresIn,
    });
}

const verifyToken = (token) => {
    let secret = process.env.JWT_SECRET || "secret";
    return jwt.verify(token, secret);

}

module.exports = {
    generateToken,
    verifyToken
}