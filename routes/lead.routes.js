// src/api/routes/leads.routes.js
const express = require('express');
const multer = require('multer');
const controller = require('../controllers/lead.controllers');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// all API routes here
router.post('/offer', controller.setOffers);
router.post('/leads/upload', upload.single('file'), controller.uploadLeads);
router.post('/score', controller.scoreLeads);
router.get('/results', controller.getResults);
router.get('/results/export', controller.exportResults); 

module.exports = router;