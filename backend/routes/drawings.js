const express = require('express');
const router = express.Router();
const Drawing = require('../models/Drawing');

// Get drawing by note ID
router.get('/note/:noteId', async (req, res) => {
  try {
    const drawing = await Drawing.findOne({ noteId: req.params.noteId });
    if (!drawing) {
      return res.json(null); // No drawing yet
    }
    res.json(drawing);
  } catch (error) {
    console.error('Error fetching drawing:', error);
    res.status(500).json({ error: 'Failed to fetch drawing' });
  }
});

// Create or update drawing for a note
router.post('/note/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { elements, imageData } = req.body;

    if (!elements || !Array.isArray(elements)) {
      return res.status(400).json({ error: 'Elements array is required' });
    }

    let drawing = await Drawing.findOne({ noteId });

    if (drawing) {
      // Update existing drawing
      drawing.elements = elements;
      if (imageData) {
        drawing.imageData = imageData;
      }
      drawing.updatedAt = new Date();
      await drawing.save();
    } else {
      // Create new drawing
      drawing = new Drawing({
        noteId,
        elements,
        imageData: imageData || null,
      });
      await drawing.save();
    }

    res.json(drawing);
  } catch (error) {
    console.error('Error saving drawing:', error);
    res.status(500).json({ error: 'Failed to save drawing' });
  }
});

// Delete drawing
router.delete('/note/:noteId', async (req, res) => {
  try {
    const result = await Drawing.deleteOne({ noteId: req.params.noteId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Drawing not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting drawing:', error);
    res.status(500).json({ error: 'Failed to delete drawing' });
  }
});

module.exports = router;
