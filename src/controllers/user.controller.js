const Joi = require("joi");
const { validateUser, User } = require("../models/user.model");
const { ValidationError, NotFoundError } = require("../utils/ApiError");
const { CatchAsync } = require("../utils/CatchAsync");

const UserController = {
    // Create a new user
    createUser: CatchAsync(async (req, res) => {
        const data = validateUser(req.body);
        const { name, email, password } = data.value;
        if (data.error) throw new ValidationError(data.error.details[0].message);

        if (!name || !email || !password) {
            throw new ValidationError("Name, email, password are required");
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new ValidationError("Email already exists");
        }

        const newUser = new User({ name, email, password, vendor: req.user?.id });
        await newUser.save();

        res.status(201).json({
            status: "success",
            data: { user: newUser },
        });
    }),

    // Get a single user by ID
    getUser: CatchAsync(async (req, res) => {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            throw new NotFoundError("User not found");
        }

        res.status(200).json({
            status: "success",
            data: { user },
        });
    }),

    // Get all users
    getAllUsers: CatchAsync(async (req, res) => {
        const users = await User.find({
            vendor: req.user?.role === 'Agent' ? req.user?.vendor : req.user?.id
        });

        res.status(200).json({
            status: "success",
            data: { users },
        });
    }),

    // Update a user by ID
    updateUser: CatchAsync(async (req, res) => {
        const { id } = req.params;
        const data = validateUser(req.body);
        if (data.error) throw new ValidationError(data.error.details[0].message);

        const user = await User.findById(id);
        if (!user) {
            throw new NotFoundError("User not found");
        }

        Object.assign(user, data.value);
        await user.save();

        res.status(200).json({
            status: "success",
            data: { user },
        });
    }),

    // Delete a user by ID
    deleteUser: CatchAsync(async (req, res) => {
        const { id } = req.params;

        await User.findByIdAndDelete(id);

        res.status(204).json({
            status: "success",
            data: null,
        });
    }),
    resetPassword: CatchAsync(async (req, res) => {
        const resetPasswordSchema = Joi.object({
            email: Joi.string().email().required(),
        });

        const { error, value: data } = resetPasswordSchema.validate(req.body);
        if (error) {
            throw new ValidationError(error.details[0].message);
        }

        const { email } = data;
        if (!email) {
            throw new ValidationError("Email and password are required");
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new NotFoundError("User not found");
        }

        user.password = "password";
        await user.save();

        res.status(200).json({
            status: "success",
            message: "Password reset successful",
        });
    })

};

module.exports = UserController;
