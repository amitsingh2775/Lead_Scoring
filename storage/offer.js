const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value_props: { type: [String], required: true },
  ideal_use_cases: { type: [String], required: true },
}, { timestamps: true });


module.exports = mongoose.models.Offer || mongoose.model('Offer', offerSchema);