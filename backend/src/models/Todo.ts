import { Schema, model } from 'mongoose';

const TodoSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  // Repeat options
  repeatType: { 
    type: String, 
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], 
    default: 'none' 
  },
  repeatInterval: { type: Number, default: 1 },
  repeatDays: [{ type: Number }],
  repeatLimit: { type: Number, default: null },
  repeatCount: { type: Number, default: 0 },
  repeatEndDate: { type: Date, default: null },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  dueDate: { type: Date, default: null },
  parentTaskId: { type: Schema.Types.ObjectId, ref: 'Todo', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model('Todo', TodoSchema);
