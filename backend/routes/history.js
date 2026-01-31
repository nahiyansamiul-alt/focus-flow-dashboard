const express = require('express');
const router = express.Router();
const History = require('../models/History');

// Get all history records
router.get('/', async (req, res) => {
  try {
    const history = await History.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get history by date
router.get('/:date', async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    const history = await History.find({
      timestamp: { $gte: startDate, $lt: endDate }
    }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching history for date:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Add a history record
router.post('/', async (req, res) => {
  try {
    if (!req.body.action || !req.body.action.trim()) {
      return res.status(400).json({ error: 'Action is required' });
    }
    const record = new History({
      action: req.body.action.trim(),
      details: req.body.details || ''
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating history record:', error);
    res.status(500).json({ error: 'Failed to create history record' });
  }
});

module.exports = router;
