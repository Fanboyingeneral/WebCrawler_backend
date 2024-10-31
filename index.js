const express = require('express');
const cors = require('cors');
const crawlRoutes = require('./routes/crawlRoutes');
const connectDB = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

connectDB();  // Connect to MongoDB

app.use('/api/crawl', crawlRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
