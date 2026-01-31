const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
});

module.exports = mongoose.model('History', HistorySchema);
