const db=require("../storage/memory")
const { Readable } = require('stream');
const { calculateRuleScore }=require("../services/rules.services")
const { getAiAnalysis }=require("../services/ai.services")
const csv = require('csv-parser');

// create the set offer controller

exports.setOffers=(req,res)=>{
    try {
        if (!req.body.name) {
    return res.status(400).json({ error: 'Invalid offer data' });
  }
  db.offer = req.body;
  res.status(201).json({ message: 'Offer details saved.' });
    } catch (error) {
        return res.status(500).json({ message: 'server side error' });
    }
}

// uploads lead controllers
exports.uploadLeads = (req, res) => {
try {
      if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded.' });
      }
    
      db.leads = []; // Clear previous leads
      const stream = Readable.from(req.file.buffer.toString());
    
      stream.pipe(csv())
        .on('data', (row) => db.leads.push(row))
        .on('end', () => res.status(200).json({ message: `${db.leads.length} leads uploaded.` }));
} catch (error) {
    return res.status(500).json({ message: 'server side error' });
}
};

//implemented leads score 
exports.scoreLeads = async (req, res) => {
  try {
    if (!db.offer || db.leads.length === 0) {
      return res.status(400).json({ error: 'Offer not set or no leads uploaded.' });
    }
  
    db.scoredResults = [];
    for (const lead of db.leads) {
      const ruleScore = calculateRuleScore(lead, db.offer);
      const { intent, aiPoints, reasoning } = await getAiAnalysis(lead, db.offer);
      const finalScore = ruleScore + aiPoints;
  
      db.scoredResults.push({ ...lead, intent, score: finalScore, reasoning });
    }
  
    res.status(200).json({ message: 'Scoring complete.' });
  } catch (error) {
     return res.status(500).json({ message: 'server side error' });
  }
};

/// get result
exports.getResults = (req, res) => {
 try {
   if (db.scoredResults.length === 0) {
     return res.status(404).json({ message: 'No scored results found. Please run scoring first.' });
   }
   res.status(200).json(db.scoredResults);
 } catch (error) {
  return res.status(500).json({ message: 'server side error' });
 }
};

// download result in csv file
exports.exportResults = (req, res) => {
    if (db.scoredResults.length === 0) {
        return res.status(404).send('No results to export.');
    }

    const header = Object.keys(db.scoredResults[0]).join(',');
    const rows = db.scoredResults.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csvContent = [header, ...rows].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('scored_leads.csv');
    res.send(csvContent);
};