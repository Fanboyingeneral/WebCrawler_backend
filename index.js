const express = require('express');
const cors = require('cors');
const crawlRoutes = require('./routes/crawlRoutes');
const connectDB = require('./db');
const cron = require('node-cron');
const { runScheduledTasks } = require('./controllers/crawlController');  

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

connectDB();  // Connect to MongoDB

app.use('/api/crawl', crawlRoutes);

// Schedule task to check for scheduled crawls every minute
cron.schedule('* * * * *', async () => {
  await runScheduledTasks();
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
