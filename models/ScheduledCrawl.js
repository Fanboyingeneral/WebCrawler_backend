const mongoose = require('mongoose');

const scheduledCrawlSchema = new mongoose.Schema({
  url: { type: String, required: true },
  maxUrls: Number,
  respectRobotFlag: Boolean,
  scheduledTime: Date,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScheduledCrawl', scheduledCrawlSchema);
