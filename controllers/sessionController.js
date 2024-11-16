// backend/controllers/sessionController.js
const UserSession = require('../models/UserSession'); 
const CrawlRequest = require('../models/CrawlRequest'); 
const CrawlData = require('../models/CrawlData'); 

// Controller function to register a new session
const registerSession = async (req, res) => {
    try {
        // Find the most recent session ID in the database and increment it
        const lastSession = await UserSession.findOne().sort({ session_id: -1 });
        const newSessionId = lastSession ? lastSession.session_id + 1 : 1; // Start from 1 if no sessions exist

        // Create a new session document with the incremented session ID
        const newSession = new UserSession({
            session_id: newSessionId
        });

        await newSession.save();

        // Respond with the generated session_id
        res.status(201).json({ session_id: newSessionId });
    } catch (error) {
        console.error('Error registering session:', error);
        res.status(500).json({ error: 'Failed to register session' });
    }
};


// Controller function to queue a crawl request
const queueCrawl = async (req, res) => {
    try {
        const { session_id, url, maxUrls, respectRobotFlag } = req.body;

        // Validate the input
        if (!session_id || !url || !maxUrls) {
            return res.status(400).json({ error: 'Missing required fields: session_id, url, maxUrls' });
        }

        // Create a new crawl request document
        const newCrawlRequest = new CrawlRequest({
            session_id,
            url,
            maxUrls,
            respectRobotFlag
        });

        // Save the request to the database
        await newCrawlRequest.save();

        // Respond with a success message
        res.status(201).json({ message: 'Crawl request queued successfully!', request: newCrawlRequest });
    } catch (error) {
        console.error('Error queuing crawl request:', error);
        res.status(500).json({ error: 'Failed to queue crawl request' });
    }
};




// Function to get pending crawl requests for a given session_id
const getPendingCrawls = async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        // Fetch all pending crawl requests for the given session_id
        const pendingCrawls = await CrawlRequest.find({
            session_id,
            status: 'pending',
        });

        if (pendingCrawls.length === 0) {
            return res.status(404).json({ error: 'No pending crawl requests found for this session' });
        }

        res.status(200).json({ crawls: pendingCrawls });
    } catch (error) {
        console.error('Error fetching pending crawl requests:', error);
        res.status(500).json({ error: 'Failed to fetch pending crawl requests' });
    }
};

const updateCrawlStatus = async (req, res) => {
    try {
        const { crawlIds, status } = req.body;

        if (!crawlIds || crawlIds.length === 0) {
            return res.status(400).json({ error: 'Crawl IDs are required' });
        }

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        // Update the status of all provided crawl IDs
        await CrawlRequest.updateMany(
            { _id: { $in: crawlIds } },
            { $set: { status } }
        );

        res.status(200).json({ message: 'Crawl statuses updated successfully.' });
    } catch (error) {
        console.error('Error updating crawl statuses:', error);
        res.status(500).json({ error: 'Failed to update crawl statuses.' });
    }
};





const updateCrawlResult = async (req, res) => {
    try {
        const { crawlId, status, data,url,maxUrls } = req.body;

        if (!crawlId || !status) {
            return res.status(400).json({ error: 'Crawl ID and status are required.' });
        }

        // Handle failure case
        if (status === 'failed') {
            // Update the crawl's status in the PendingCrawl collection
            await CrawlRequest.updateOne(
                { _id: crawlId },
                { $set: { status: 'failed' } }
            );

            return res.status(200).json({ message: `Crawl request ${crawlId} marked as failed.` });
        }

        // Handle completion case
        if (status === 'completed') {
            if (!data) {
                return res.status(400).json({ error: 'Scraped data is required for completed status.' });
            }

            const { message, scraped_urls, external_urls} = data;

            // Validate the data format
            if (
                typeof scraped_urls !== 'object' ||
                !Array.isArray(external_urls) ||
                !url ||
                typeof maxUrls !== 'number'
            ) {
                return res.status(400).json({ error: 'Invalid data format in the request.' });
            }

            // Get the latest crawl ID from the database
            const lastCrawl = await CrawlData.findOne().sort({ crawl_id: -1 });
            const newCrawlId = lastCrawl ? lastCrawl.crawl_id + 1 : 1;

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

            // Update the crawl's status in the PendingCrawl collection
            await CrawlRequest.updateOne(
                { _id: crawlId },
                { $set: { status: 'completed' } }
            );

            return res.status(200).json({ message: `Crawl request ${crawlId} marked as completed.` });
        }

        // Handle invalid status
        return res.status(400).json({ error: 'Invalid status provided.' });
    } catch (error) {
        console.error('Error in updating crawl result:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};



module.exports = { registerSession, queueCrawl, getPendingCrawls, updateCrawlStatus,updateCrawlResult };