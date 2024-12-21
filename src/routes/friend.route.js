const express = require("express");
const FriendController = require("../controllers/friend.controller");
const { authenticate } = require("../middelwares/auth");

const router = express.Router();

router.post("/request", authenticate, FriendController.sendRequest);
router.put("/respond", authenticate, FriendController.respondToRequest);
router.get("/list", authenticate, FriendController.getFriendList);
router.get("/requests", authenticate, FriendController.getPendingRequests);

module.exports = router;