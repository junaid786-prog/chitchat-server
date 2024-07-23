const mongoose = require('mongoose');
const joi = require('joi');

const moodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String
    },
    title: String,
    note: String
}, { timestamps: true })

const Mood = mongoose.model('Mood', moodSchema);

function validateMood(mood) {
    const schema = joi.object({
        
    });

    return schema.validate(mood);
}

module.exports = {
    Mood,
    validateMood
};