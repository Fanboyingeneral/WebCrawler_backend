const axios = require('axios');

// Controller function to trigger the crawler engine
const startCrawl = async (req, res) => {
  const { url, maxUrls, respectRobotFlag } = req.body;

  try {
    // Call the crawler engine (Python service) via HTTP request
    const response = await axios.post('http://crawler_engine:8000/crawl', { url, maxUrls, respectRobotFlag });
    //console.log('Crawl response:', response.data);
    res.status(200).json(response.data); // Send crawled data back to frontend
  } catch (error) {
    console.error('Error starting crawl:', error.message);
    res.status(500).json({ error: 'Failed to start crawl' });
  }
};

module.exports = { startCrawl };
