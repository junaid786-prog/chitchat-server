// src/routes/notification.route.js
const express = require("express");
const NotificationController = require("../controllers/notification.controller");
const { authenticate } = require("../middelwares/auth");

const router = express.Router();

router.post("/", authenticate, NotificationController.createNotification);
router.get("/", authenticate, NotificationController.getNotifications);
router.put("/read", authenticate, NotificationController.markAsRead);

module.exports = router;
