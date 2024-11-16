const mongoose = require('mongoose');

const crawlRequestSchema = new mongoose.Schema({
    session_id: {
        type: mongoose.Schema.Types.String,
        ref: 'UserSession',
        required: true
    },
    url: {
        type: String,
        required: true
    },
    maxUrls: {
        type: Number,
        required: true
    },
    respectRobotFlag: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'failed'],
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    completed_at: {
        type: Date
    }
});

module.exports = mongoose.model('CrawlRequest', crawlRequestSchema);
