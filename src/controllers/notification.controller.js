// src/controllers/notification.controller.js
const Notification = require("../models/notification.model");
const { CatchAsync } = require("../utils/CatchAsync");

const NotificationController = {
  createNotification: CatchAsync(async (req, res) => {
    const { user, type, content } = req.body;

    if (!user || !type || !content) {
      return res.status(400).json({ status: "error", message: "Missing required fields." });
    }

    const notification = new Notification({ user, type, content });
    await notification.save();

    res.status(201).json({ status: "success", notification });
  }),

  getNotifications: CatchAsync(async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalNotifications = await Notification.countDocuments({ user: req.user.id });

    res.status(200).json({
      status: "success",
      notifications,
      total: totalNotifications,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalNotifications / limit),
    });
  }),

  markAsRead: CatchAsync(async (req, res) => {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ status: "error", message: "Invalid notification IDs." });
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds }, user: req.user.id },
      { isRead: true }
    );

    res.status(200).json({ status: "success", message: "Notifications marked as read." });
  }),
};

module.exports = NotificationController;
