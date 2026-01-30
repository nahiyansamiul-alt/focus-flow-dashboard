import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import todoRoutes from './routes/todoRoutes';
import noteRoutes from './routes/noteRoutes';
import historyRoutes from './routes/historyRoutes';
import folderRoutes from './routes/folderRoutes';
import sessionRoutes from './routes/sessionRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/todos', todoRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/sessions', sessionRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || '', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

export default app;
