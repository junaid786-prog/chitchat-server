const express = require("express");
const { authenticate } = require("../middelwares/auth");
const router = express.Router();

router.use("/auth", require("./auth.route"));

module.exports = router;