// src/controllers/auth.controller.js
const User = require("../models/user.model");
const { generateToken } = require("../utils/tokens");
const { CatchAsync } = require("../utils/CatchAsync");
const Joi = require("joi");

const AuthController = {
  createAnonymousSession: CatchAsync(async (req, res) => {
    const timestamp = Date.now();

    const uniqueEmail = `anonymous-${timestamp}-${Math.floor(Math.random() * 100)}@gmail.com`;
    const user = new User({
      isAnonymous: true,
      username: `Anonymous-${Math.floor(Math.random() * 1000000)}`,
      email: uniqueEmail
    });
    await user.save();
    const token = generateToken({
      _id: user._id,
      isAnonymous: user.isAnonymous,
      username: user.username,
      premium: user.premium,
    });
    res.status(201).json({
      status: "success",
      token,
      user: {
        id: user._id,
        isAnonymous: user.isAnonymous,
        username: user.username,
      },
    });
  }),

  register: CatchAsync(async (req, res) => {
    const schema = Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
    }

    const user = new User(value);
    await user.save();
    const token = generateToken(user);
    res.status(201).json({
      status: "success",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  }),

  login: CatchAsync(async (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
    }

    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email or password" });
    }

    const token = generateToken(user);
    res.status(200).json({
      status: "success",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  }),

  getProfile: CatchAsync(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", user });
  }),

  updateProfile: CatchAsync(async (req, res, next) => {
    const schema = Joi.object({
      username: Joi.string().optional(),
      email: Joi.string().email().optional(),
      allowFriendRequest: Joi.boolean().optional(),
      notificationSound: Joi.boolean().optional(),
      pushNotification: Joi.boolean().optional(),
      premium: Joi.boolean().optional(),
      isAnonymous:Joi.boolean().optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new Error(error.details[0].message));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { ...value },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new Error("User not found"));
    }

    res.status(200).json({
      status: "success",
      message: 'Profile Updated Successfully'
    });
  }),

  changeUserName: CatchAsync(async (req, res) => {
    const schema = Joi.object({
      username: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const { username } = value;
    await user.updateUsername(username);

    return res.status(200).json({ status: "success", message: "username updated successfully" });
  })
};

module.exports = AuthController;
