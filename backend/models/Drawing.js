const mongoose = require('mongoose');

const DrawingSchema = new mongoose.Schema({
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  elements: [{
    id: String,
    tool: { type: String, enum: ['pen', 'highlighter', 'eraser', 'line', 'rect', 'circle', 'text'] },
    // For draw elements (pen, highlighter, eraser)
    points: [Number],
    stroke: String,
    strokeWidth: Number,
    opacity: Number,
    globalCompositeOperation: String,
    // For line elements
    // For rect elements
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    // For circle elements
    radiusX: Number,
    radiusY: Number,
    // For text elements
    text: String,
    fontSize: Number,
    fill: String,
  }],
  imageData: String, // Base64 PNG of the drawing (for quick preview)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Drawing', DrawingSchema);
