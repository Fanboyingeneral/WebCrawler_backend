const express = require('express');
const { startCrawl, getAllRecords, getCrawlDetails, getPageDetails, storeScheduledCrawl, getAllScheduledCrawls,deleteScheduledCrawl, deleteCompletedCrawl } = require('../controllers/crawlController');

const router = express.Router();

// POST route to trigger the crawler engine
router.post('/', startCrawl);
router.post('/scheduled', storeScheduledCrawl);
router.get('/getScheduledCrawls', getAllScheduledCrawls);
router.delete('/deleteScheduledCrawl/:id', deleteScheduledCrawl);
router.delete('/deleteCompletedCrawl/:id', deleteCompletedCrawl);
router.get('/records', getAllRecords);
router.get('/records/:crawlId', getCrawlDetails);
router.get('/records/:crawlId/page/:pageId', getPageDetails);

module.exports = router;



