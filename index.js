const express = require('express');
const cors = require('cors');
const crawlRoutes = require('./routes/crawlRoutes');

const app = express();
const PORT = 5000;

app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON bodies

app.use('/api/crawl', crawlRoutes); // Route for crawl operations

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
