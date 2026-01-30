import { Schema, model } from 'mongoose';

const FolderSchema = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model('Folder', FolderSchema);