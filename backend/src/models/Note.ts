import { Schema, model } from 'mongoose';

const NoteSchema = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model('Note', NoteSchema);