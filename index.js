require('dotenv').config();
const express = require('express');
const cors = require('cors');
const leadRoutes = require('./routes/lead.routes');
const {connectDB}=require("./config/db")


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/v1/leads",leadRoutes)
app.get('/', (req, res) => {
  res.send('Lead Scoring API is running. Check /api/v1/... endpoints');
});

// Start the server
app.listen(PORT, async() => {
  await connectDB()
  console.log(`Server is live on http://localhost:${PORT}`);
});