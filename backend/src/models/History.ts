import { Schema, model } from 'mongoose';

const HistorySchema = new Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default model('History', HistorySchema);