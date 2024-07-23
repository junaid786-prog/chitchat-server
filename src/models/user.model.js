const mongoose = require('mongoose');
const joi = require('joi');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Super', 'Admin', 'Agent'], default: 'Agent' },
}, { timestamps: true })

// before saving the user, hash the password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// compare the password
userSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
}

const User = mongoose.model('User', userSchema);
function validateUser(user) {
    const schema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        role: joi.string().valid('Super', 'Admin', 'Agent').default('Agent'),
    });

    return schema.validate(user);
}

module.exports = {
    User,
    validateUser
};