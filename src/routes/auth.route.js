// src/routes/auth.route.js
const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { authenticate } = require("../middelwares/auth");

const router = express.Router();

router.post("/session", AuthController.createAnonymousSession);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authenticate, AuthController.getProfile);
router.put("/update/profile", authenticate, AuthController.updateProfile);
router.put("/change-username", authenticate, AuthController.changeUserName);

module.exports = router;