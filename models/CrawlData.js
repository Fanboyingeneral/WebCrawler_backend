const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  url: String,
  content: String,
  status: String,
});

const crawlDataSchema = new mongoose.Schema({
  crawl_id: { type: Number, required: true, unique: true },
  message: String,
  root_url: String,
  crawl_limit: Number,
  timestamp: { type: Date, default: Date.now },
  scraped_urls: [pageSchema],     // For URLs with content
  external_urls: [String],        // List of discovered but unprocessed URLs
});

module.exports = mongoose.model('CrawlData', crawlDataSchema);
