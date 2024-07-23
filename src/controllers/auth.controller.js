const Joi = require("joi");
const { User } = require("../models/user.model");
const { ValidationError, APIError } = require("../utils/ApiError");
const { CatchAsync } = require("../utils/CatchAsync");
const { generateToken } = require("../utils/tokens");
const { registerSchema, loginSchema } = require("../lib/schema");

const AuthController = {
    login: CatchAsync(async (req, res) => {
        const { error, value: data } = loginSchema.validate(req.body);
        if (error) {
            throw new ValidationError(error.details[0].message);
        }

        const { email, password } = data;
        const user = await User.findOne({ email });
        if (!user) {
            throw new APIError("User not found", 404);
        }

        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            throw new APIError("Invalid email or password", 401);
        }

        const token = generateToken(user.id);
        res.status(200).json({
            status: "success",
            token,
            data: user,
        });
    }),

    register: CatchAsync(async (req, res) => {
        const { error, value: data } = registerSchema.validate(req.body);
        if (error) {
            throw new ValidationError(error.details[0].message);
        }

        const user = new User(data);
        await user.save();

        res.status(201).json({
            status: "success",
            data: user,
        });
    }),

    getProfile: CatchAsync(async (req, res) => {
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new APIError("User not found", 404);
        }

        res.status(200).json({
            status: "success",
            data: user,
        });

    }),
    
    changePassword: CatchAsync(async (req, res) => {
        const changePasswordSchema = Joi.object({
            currentPassword: Joi.string().min(3).required(),
            newPassword: Joi.string().min(6).required(),
        });

        const { error, value: data } = changePasswordSchema.validate(req.body);
        if (error) {
            throw new ValidationError(error.details[0].message);
        }

        const { currentPassword, newPassword } = data;
        if (!currentPassword || !newPassword) {
            throw new ValidationError("Old password and new password are required");
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            throw new ValidationError("User not found");
        }

        const validPassword = await user.comparePassword(currentPassword);
        if (!validPassword) {
            throw new ValidationError("Invalid old password");
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            status: "success",
            message: "Password changed successfully",
        });
    })
};

module.exports = AuthController;
