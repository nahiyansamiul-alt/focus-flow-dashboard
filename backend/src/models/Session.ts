import { Schema, model } from 'mongoose';

const SessionSchema = new Schema({
  userId: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
});

export default model('Session', SessionSchema);