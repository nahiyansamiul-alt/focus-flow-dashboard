import { Schema, model } from 'mongoose';

const FolderSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#5227FF' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model('Folder', FolderSchema);