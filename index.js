const express = require('express');
const cors = require('cors');
const crawlRoutes = require('./routes/crawlRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const connectDB = require('./db');
const cron = require('node-cron');
const { runScheduledTasks } = require('./controllers/crawlController');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

connectDB();  // Connect to MongoDB

app.use('/api/crawl', crawlRoutes);
app.use('/api/session', sessionRoutes); // Add the session route here

// Schedule task to check for scheduled crawls every minute
cron.schedule('* * * * *', async () => {
    await runScheduledTasks();
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
