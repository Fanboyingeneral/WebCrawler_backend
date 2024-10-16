const express = require('express');
const { startCrawl } = require('../controllers/crawlController');

const router = express.Router();

// POST route to trigger the crawler engine
router.post('/', startCrawl);

module.exports = router;
