const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// Get all reminders
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ date: 1 });
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get reminders for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const reminders = await Reminder.find({
      date: { $gte: startOfDay, $lt: endOfDay }
    }).sort({ date: 1 });
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by date:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Create a new reminder
router.post('/', async (req, res) => {
  try {
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ error: 'Reminder title is required' });
    }
    if (!req.body.date) {
      return res.status(400).json({ error: 'Reminder date is required' });
    }

    const reminder = new Reminder({
      title: req.body.title.trim(),
      description: req.body.description || '',
      date: new Date(req.body.date),
      completed: req.body.completed || false,
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Update a reminder
router.put('/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.date !== undefined) updates.date = new Date(req.body.date);
    if (req.body.completed !== undefined) updates.completed = req.body.completed;
    updates.updatedAt = Date.now();

    const reminder = await Reminder.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Delete a reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

module.exports = router;
