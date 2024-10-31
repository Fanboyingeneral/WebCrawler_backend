const express = require('express');
const { startCrawl, getAllRecords, getCrawlDetails, getPageDetails } = require('../controllers/crawlController');

const router = express.Router();

// POST route to trigger the crawler engine
router.post('/', startCrawl);
router.get('/records', getAllRecords);
router.get('/records/:crawlId', getCrawlDetails);
router.get('/records/:crawlId/page/:pageId', getPageDetails);

module.exports = router;



