const mongoose = require('mongoose');

// Defines the structure for a scored lead result
const scoredLeadSchema = new mongoose.Schema({
  // Original lead data
  name: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  linkedin_bio: { type: String, required: true },

  // Added scoring data
  intent: {
    type: String,
    enum: ['High', 'Medium', 'Low'], // Ensures intent can only be one of these values
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  reasoning: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const ScoredLead = mongoose.model('ScoredLead', scoredLeadSchema);

module.exports = ScoredLead;