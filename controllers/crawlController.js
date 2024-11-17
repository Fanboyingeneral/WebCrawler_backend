const axios = require('axios');
const CrawlData = require('../models/CrawlData');
const ScheduledCrawl = require('../models/ScheduledCrawl');

const CRAWLER_ENGINE_PORT = process.env.CRAWLER_ENGINE_PORT;

const startCrawl = async (req, res) => {
  const { url, maxUrls, respectRobotFlag } = req.body;
  console.log("*********Respect Robot Flag: ", respectRobotFlag);
  try {
    // Find the most recent crawl_id in the database and increment it
    const lastCrawl = await CrawlData.findOne().sort({ crawl_id: -1 });
    const newCrawlId = lastCrawl ? lastCrawl.crawl_id + 1 : 1;  // If no entries, start at 1

    // Call the crawler engine
    const response = await axios.post(`http://crawler_engine:${CRAWLER_ENGINE_PORT}/crawl`, { url, maxUrls, respectRobotFlag });
    
    // Log response data for debugging
    console.log('Crawl response data:', response.data);

    const {message, scraped_urls, external_urls } = response.data;

    // Validate the response format
    if (typeof scraped_urls !== 'object' || !Array.isArray(external_urls)) {
      return res.status(500).json({ error: 'Crawler engine did not return expected data format' });
    }

    // Map scraped_urls from object to array of { url, content, status }
    const formattedScrapedUrls = Object.entries(scraped_urls).map(([url, content]) => ({
      url,
      content,
      status: 'success',
    }));

    // Create a new crawl data document with the new crawl_id
    const crawlData = new CrawlData({
      crawl_id: newCrawlId,
      message: message,
      root_url: url,
      crawl_limit: maxUrls,
      scraped_urls: formattedScrapedUrls,
      external_urls: Array.from(external_urls), // Convert set to array
    });

    // Save to MongoDB
    await crawlData.save();

    res.status(200).json({message: message});
  } catch (error) {
    console.error('Error starting crawl:', error.message);
    res.status(500).json({ error: 'Failed to start crawl' });
  }
};

const startScheduledCrawl = async (scheduledCrawl) => {
  const { url, maxUrls, respectRobotFlag } = scheduledCrawl;

  try {
    // Find the most recent crawl_id in the database and increment it
    const lastCrawl = await CrawlData.findOne().sort({ crawl_id: -1 });
    const newCrawlId = lastCrawl ? lastCrawl.crawl_id + 1 : 1;  // If no entries, start at 1

    // Call the crawler engine
    const response = await axios.post(`http://crawler_engine:${CRAWLER_ENGINE_PORT}/crawl`, { url, maxUrls, respectRobotFlag });

    // Log response data for debugging
    console.log('Crawl response data:', response.data);

    const { message, scraped_urls, external_urls } = response.data;

    // Validate the response format
    if (typeof scraped_urls !== 'object' || !Array.isArray(external_urls)) {
      console.error('Crawler engine did not return expected data format');
      return;
    }

    // Map scraped_urls from object to array of { url, content, status }
    const formattedScrapedUrls = Object.entries(scraped_urls).map(([url, content]) => ({
      url,
      content,
      status: 'success',
    }));

    // Create a new crawl data document with the new crawl_id
    const crawlData = new CrawlData({
      crawl_id: newCrawlId,
      message: message,
      root_url: url,
      crawl_limit: maxUrls,
      scraped_urls: formattedScrapedUrls,
      external_urls: Array.from(external_urls), // Convert set to array
    });

    // Save to MongoDB
    await crawlData.save();

    console.log(`Scheduled crawl executed for URL: ${url}`);
  } catch (error) {
    console.error('Error starting scheduled crawl:', error.message);
  }
};






// Function to check for and run scheduled tasks
const runScheduledTasks = async () => {
  const now = new Date();

  try {
    // Find all pending scheduled crawls that are due to be executed
    const dueCrawls = await ScheduledCrawl.find({
      status: 'pending',
      scheduledTime: { $lte: now },
    });

    // Execute each due crawl
    for (const scheduledCrawl of dueCrawls) {
      await startScheduledCrawl(scheduledCrawl);
      scheduledCrawl.status = 'completed'; // Update status to completed
      await scheduledCrawl.save();
    }
  } catch (error) {
    console.error('Error running scheduled tasks:', error.message);
  }
};





// Endpoint to get all crawl records
const getAllRecords = async (req, res) => {
  try {
    const records = await CrawlData.find();
    // console.log("*********Records: ", records);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crawl records' });
  }
};

// Endpoint to get specific crawl details
const getCrawlDetails = async (req, res) => {
  const crawlId = parseInt(req.params.crawlId, 10);
  try {
    const record = await CrawlData.findOne({ crawl_id: crawlId });  // Use Mongoose model directly
    if (record) {
      res.status(200).json(record);
    } else {
      res.status(404).json({ error: 'Crawl details not found' });
    }
  } catch (error) {
    console.error("Error fetching crawl details:", error);
    res.status(500).json({ error: 'Failed to fetch crawl details', details: error.message });
  }
};

//To view the scraped content of a specific page
const getPageDetails = async (req, res) => {
  const { crawlId, pageId } = req.params;
  try {
    const crawlRecord = await CrawlData.findOne({ crawl_id: crawlId, 'scraped_urls._id': pageId });
    const pageData = crawlRecord.scraped_urls.id(pageId);
    if (pageData) {
      res.json(pageData);
    } else {
      res.status(404).json({ message: 'Page not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving page data' });
  }
};

// Endpoint to store scheduled crawl
const storeScheduledCrawl = async (req, res) => {
  const { url, maxUrls, respectRobotFlag, scheduledTime } = req.body;

  try {
    // Save the new scheduled crawl with default status 'pending'
    const scheduledCrawl = new ScheduledCrawl({
      url,
      maxUrls,
      respectRobotFlag,
      scheduledTime,
      status: 'pending' // Default status is pending
    });

    await scheduledCrawl.save();
    res.status(201).json({ message: 'Scheduled crawl stored successfully', crawl: scheduledCrawl });
  } catch (error) {
    console.error("Error storing scheduled crawl:", error);
    res.status(500).json({ error: 'Failed to store scheduled crawl' });
  }
};


const getAllScheduledCrawls = async (req, res) => {
  try {
    const scheduledCrawls = await ScheduledCrawl.find();
    res.status(200).json(scheduledCrawls);
  } catch (error) {
    console.error("Error fetching scheduled crawls:", error);
    res.status(500).json({ error: 'Failed to fetch scheduled crawls' });
  }
};

//delete a scheduled crawl by id
const deleteScheduledCrawl = async (req, res) => {
  try {
    await ScheduledCrawl.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Scheduled crawl deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete scheduled crawl' });
  }
};

const deleteCompletedCrawl = async (req, res) => {
  try {
    await CrawlData.deleteOne({ crawl_id: req.params.id });
    res.status(200).json({ message: 'Completed crawl deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete completed crawl' });
  }
};

module.exports = { startCrawl, getAllRecords, getCrawlDetails, getPageDetails, storeScheduledCrawl, getAllScheduledCrawls, deleteScheduledCrawl, deleteCompletedCrawl, runScheduledTasks };

