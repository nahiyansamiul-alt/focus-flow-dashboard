const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  // Repeat options
  repeatType: { 
    type: String, 
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], 
    default: 'none' 
  },
  repeatInterval: { type: Number, default: 1 }, // Every X days/weeks/months/years
  repeatDays: [{ type: Number }], // For weekly: 0=Sun, 1=Mon, etc.
  repeatLimit: { type: Number, default: null }, // Max repetitions (null = unlimited)
  repeatCount: { type: Number, default: 0 }, // Current repetition count
  repeatEndDate: { type: Date, default: null }, // End date for repetition
  // Priority
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  // Due date
  dueDate: { type: Date, default: null },
  // Parent task (for repeated instances)
  parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Todo', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Todo', TodoSchema);
