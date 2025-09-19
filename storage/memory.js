// this is inmemory db which will store the application stated further i will use redis for cache
const db = {
  offer: null, // initialy offer will be nill
  leads: [], // it will store the leads 
  scoredResults: [], // this is array of results
};

module.exports = db;