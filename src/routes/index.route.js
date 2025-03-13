const express = require("express");
const { authenticate } = require("../middelwares/auth");
const uploadController = require("../controllers/upload.controller");
const { upload } = require("../middelwares/multerConfig");
const router = express.Router();

router.use("/auth", require("./auth.route"));
router.use("/friends", authenticate, require("./friend.route"));
router.use("/chats", authenticate, require("./chat.route"));
router.use("/notifications", authenticate, require("./notification.route"));
router.post('/uploads/upload', authenticate, upload.single('file'), uploadController.uploadFile);
module.exports = router;