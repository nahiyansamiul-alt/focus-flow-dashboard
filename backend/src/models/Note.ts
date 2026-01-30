import { Schema, model } from 'mongoose';

const NoteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  folderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Folder',
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model('Note', NoteSchema);