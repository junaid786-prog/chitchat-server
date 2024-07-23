const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { authenticate, isAdmin } = require("../middelwares/auth");
const UserController = require("../controllers/user.controller");

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.get("/me",authenticate, AuthController.getProfile);
router.put("/reset-password", UserController.resetPassword);

module.exports = router;