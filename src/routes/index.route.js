const express = require("express");
const { authenticate } = require("../middelwares/auth");
const router = express.Router();

router.use("/auth", require("./auth.route"));
router.use("/friends", authenticate, require("./friend.route"));
module.exports = router;