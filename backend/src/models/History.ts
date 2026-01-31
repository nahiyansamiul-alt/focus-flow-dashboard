import { Schema, model } from 'mongoose';

const HistorySchema = new Schema({
  action: { type: String, required: true },
  details: { type: String },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  duration: { type: Number }, // duration in minutes for focus sessions
  startTime: { type: String },
  endTime: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Index by date for faster queries
HistorySchema.index({ date: 1 });

export default model('History', HistorySchema);