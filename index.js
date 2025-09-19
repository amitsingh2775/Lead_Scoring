require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Lead Scoring API is running. Check /api/v1/... endpoints');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is live on http://localhost:${PORT}`);
});