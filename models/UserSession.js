const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
    session_id: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = mongoose.model('UserSession', userSessionSchema);
