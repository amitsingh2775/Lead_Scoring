// Import Mongoose models instead of the in-memory db
const Offer = require('../storage/offer');
const Lead = require('../storage/lead');
const ScoredLead = require('../storage/scoredLead');

const { Readable } = require('stream');
const { calculateRuleScore } = require("../services/rules.services");
const { getAiAnalysis } = require("../services/ai.services");
const csv = require('csv-parser');



exports.setOffers = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ error: 'Invalid offer data' });
    }
    // Delete any old offers to ensure only one is active, then create the new one.
    await Offer.deleteMany({});
    const newOffer = await Offer.create(req.body);

    res.status(201).json({ message: 'Offer details saved to database.', data: newOffer });
  } catch (error) {
    res.status(500).json({ message: 'Server error while saving offer.', error });
  }
};

exports.uploadLeads = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded.' });
    }
    
    const leadsFromCsv = [];
    const stream = Readable.from(req.file.buffer.toString());
    
    stream.pipe(csv())
      .on('data', (row) => leadsFromCsv.push(row))
      .on('end', async () => {
        try {
          // When CSV parsing is done, clear old data and insert new leads into the database.
          await Lead.deleteMany({});
          await ScoredLead.deleteMany({}); // Also clear old scored results
          await Lead.insertMany(leadsFromCsv);
          
          res.status(200).json({ message: `${leadsFromCsv.length} leads saved to database.` });
        } catch (dbError) {
          res.status(500).json({ message: 'Error saving leads to database.', error: dbError });
        }
      });
  } catch (error) {
    res.status(500).json({ message: 'Server error during file upload.', error });
  }
};

exports.scoreLeads = async (req, res) => {
  console.log("--- Starting the scoring process... ---"); // Log when the function starts

  try {
    // 1. Fetching initial data
    console.log("Step 1: Fetching offer and leads from the database...");
    const offer = await Offer.findOne();
    const leads = await Lead.find();
    console.log("Step 1 Complete: Data fetched.");

    if (!offer) {
      console.error("DEBUG: Offer not found in the database.");
    }
    if (leads.length === 0) {
      console.error("DEBUG: No leads found in the database.");
    }

    if (!offer || leads.length === 0) {
      return res.status(400).json({ error: 'Offer not set or no leads found in database.' });
    }

    // 2. Processing each lead in a loop
 
    const resultsToSave = [];
    for (const [index, lead] of leads.entries()) {
     

      const ruleScore = calculateRuleScore(lead, offer);
     
      
      const { intent, aiPoints, reasoning } = await getAiAnalysis(lead, offer);
      
      
      const finalScore = ruleScore + aiPoints;
     

      resultsToSave.push({ ...lead.toObject(), intent, score: finalScore, reasoning });
    }
   
    // 3. Saving the results to the database
  
    await ScoredLead.deleteMany({});
    await ScoredLead.insertMany(resultsToSave);
    

    res.status(200).json({ message: 'Scoring complete and results saved.' });

  } catch (error) {

    res.status(500).json({
        message: 'Server error during scoring.',
        errorDetails: error.message || "An unknown error occurred."
    });
  }
};

exports.getResults = async (req, res) => {
 try {
    // Fetch results directly from the ScoredLead collection in MongoDB.
    const results = await ScoredLead.find();
    if (results.length === 0) {
      return res.status(404).json({ message: 'No scored results found in database.' });
    }
    res.status(200).json(results);
 } catch (error) {
   res.status(500).json({ message: 'Server error while fetching results.', error });
 }
};

exports.exportResults = async (req, res) => {
  try {
    // Fetch results from MongoDB. .lean() is a performance optimization for read-only queries.
    const results = await ScoredLead.find().lean();
    if (results.length === 0) {
        return res.status(404).send('No results to export.');
    }

    // Remove MongoDB-specific fields like _id and __v for a cleaner CSV
    const cleanedResults = results.map(doc => {
        delete doc._id;
        delete doc.__v;
        delete doc.createdAt;
        delete doc.updatedAt;
        return doc;
    });

    const header = Object.keys(cleanedResults[0]).join(',');
    const rows = cleanedResults.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    const csvContent = [header, ...rows].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('scored_leads.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Server error during CSV export.', error });
  }
};