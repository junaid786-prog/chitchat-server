const { verifyToken } = require("../utils/tokens");
// authenticate user
const authenticate = (req, res, next) => {
    const token = req.headers.authorization || req.headers.Authorization || req.headers["x-access-token"];
    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Unauthorized",
        });
    }
    try {
        const user = verifyToken(token);
        req.user = user;
        console.log(user);
        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Unauthorized",
        });
    }
}

const isAdmin = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({
            status: "error",
            message: "Forbidden",
        });
    }
    next();
}

module.exports = { authenticate, isAdmin };
