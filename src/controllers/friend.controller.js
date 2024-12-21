const FriendRequest = require("../models/friendRequest.model");
const User = require("../models/user.model");
const { CatchAsync } = require("../utils/CatchAsync");

const FriendController = {
  sendRequest: CatchAsync(async (req, res) => {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ status: "error", message: "Receiver ID is required." });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: req.user.id,
      receiver: receiverId,
      status: "Pending",
    });

    if (existingRequest) {
      return res.status(400).json({ status: "error", message: "Friend request already sent." });
    }

    const friendRequest = new FriendRequest({
      sender: req.user.id,
      receiver: receiverId,
    });
    await friendRequest.save();

    res.status(201).json({ status: "success", message: "Friend request sent." });
  }),

  respondToRequest: CatchAsync(async (req, res) => {
    const { requestId, status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ status: "error", message: "Invalid status." });
    }

    const request = await FriendRequest.findById(requestId);
    if (!request || request.receiver.toString() !== req.user.id) {
      return res.status(404).json({ status: "error", message: "Friend request not found." });
    }

    request.status = status;
    await request.save();

    if (status === "Accepted") {
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { friends: request.sender } });
      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: req.user.id } });
    }

    res.status(200).json({ status: "success", message: `Friend request ${status.toLowerCase()}.` });
  }),

  getFriendList: CatchAsync(async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id)
      .select("friends")
      .populate({
        path: "friends",
        select: "username email",
        options: { limit: parseInt(limit), skip: parseInt(skip) },
      });

    const totalFriends = user.friends.length;

    res.status(200).json({
      status: "success",
      friends: user.friends,
      total: totalFriends,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFriends / limit),
    });
  }),

  getPendingRequests: CatchAsync(async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const incoming = await FriendRequest.find({
      receiver: req.user.id,
      status: "Pending",
    })
      .populate("sender", "username email")
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const outgoing = await FriendRequest.find({
      sender: req.user.id,
      status: "Pending",
    })
      .populate("receiver", "username email")
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      status: "success",
      incoming,
      outgoing,
      currentPage: parseInt(page),
      totalPages: Math.ceil(incoming.length / limit),
    });
  }),
};

module.exports = FriendController;
