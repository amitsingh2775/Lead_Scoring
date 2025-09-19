const db=require("../storage/memory")


// create the set offer controller

exports.setOffers=(req,res)=>{
    try {
        if (!req.body.name) {
    return res.status(400).json({ error: 'Invalid offer data' });
  }
  db.offer = req.body;
  res.status(201).json({ message: 'Offer details saved.' });
    } catch (error) {
        res.status(500).json({ message: 'server side error' });
    }
}