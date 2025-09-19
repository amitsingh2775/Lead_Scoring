const db=require("../storage/memory")
const { Readable } = require('stream');

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