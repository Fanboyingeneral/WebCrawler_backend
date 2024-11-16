// backend/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const { registerSession, queueCrawl, getPendingCrawls,updateCrawlStatus,updateCrawlResult } = require('../controllers/sessionController');

// POST endpoint to register a new session
router.post('/register', registerSession);
router.post('/queueCrawl', queueCrawl);
router.get('/get-pending-crawls', getPendingCrawls);
router.post('/update-crawl-status', updateCrawlStatus);
router.post('/update-crawl-result', updateCrawlResult);

module.exports = router;
