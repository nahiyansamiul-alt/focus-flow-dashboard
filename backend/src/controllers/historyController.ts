import { Request, Response } from 'express';
import { allAsync, runAsync, getAsync } from '../database';

export const getHistory = async (_req: Request, res: Response) => {
  try {
    const history = await allAsync(
      'SELECT * FROM history ORDER BY timestamp DESC'
    );
    // Add _id field for frontend compatibility
    const mapped = history.map(h => ({ ...h, _id: h.id }));
    res.json(mapped);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch history' });
  }
};

export const getHistoryByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const history = await allAsync(
      'SELECT * FROM history WHERE date = ? ORDER BY timestamp DESC',
      [date]
    );
    // Add _id field for frontend compatibility
    const mapped = history.map(h => ({ ...h, _id: h.id }));
    res.json(mapped);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch history for date' });
  }
};

export const createHistory = async (req: Request, res: Response) => {
  try {
    const { action, details, duration, startTime, endTime } = req.body;
    
    // Set date to today if not provided
    const date = new Date().toISOString().split('T')[0];
    
    const result = await runAsync(
      `INSERT INTO history (action, details, duration, startTime, endTime, date, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [action, details, duration || null, startTime || null, endTime || null, date]
    );
    
    // Fetch and return the created record
    const history = await getAsync(
      'SELECT * FROM history WHERE id = ?',
      [result.id]
    );
    
    res.status(201).json({ ...history, _id: history.id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create history entry' });
  }
};
