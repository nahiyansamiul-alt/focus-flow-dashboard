import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database';

import todoRoutes from './routes/todoRoutes';
import noteRoutes from './routes/noteRoutes';
import historyRoutes from './routes/historyRoutes';
import folderRoutes from './routes/folderRoutes';
import sessionRoutes from './routes/sessionRoutes';
import reminderRoutes from './routes/reminderRoutes';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite database
initializeDatabase();

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/todos', todoRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reminders', reminderRoutes);

console.log('Focus Flow Backend initialized with SQLite');

export default app;
