const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');

// Get all folders
router.get('/', async (req, res) => {
  try {
    const folders = await Folder.find().sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Create a new folder
router.post('/', async (req, res) => {
  try {
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    if (!req.body.color) {
      return res.status(400).json({ error: 'Folder color is required' });
    }
    const folder = new Folder({
      name: req.body.name.trim(),
      color: req.body.color
    });
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update a folder
router.put('/:id', async (req, res) => {
  try {
    const folder = await Folder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.json(folder);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// Delete a folder
router.delete('/:id', async (req, res) => {
  try {
    const folder = await Folder.findByIdAndDelete(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

module.exports = router;
