const express = require("express");
const { authenticate } = require("../middelwares/auth");
const router = express.Router();

router.use("/auth", require("./auth.route"));
router.use("/friends", authenticate, require("./friend.route"));
router.use("/chats", authenticate, require("./chat.route"));
module.exports = router;