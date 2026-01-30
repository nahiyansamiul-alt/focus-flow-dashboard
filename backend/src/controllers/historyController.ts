import History from '../models/History';
import { Request, Response } from 'express';

export const getHistory = async (_req: Request, res: Response) => {
  try {
    const history = await History.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch history' });
  }
};

export const getHistoryByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const history = await History.find({ date }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch history for date' });
  }
};

export const createHistory = async (req: Request, res: Response) => {
  try {
    const { action, details, duration, startTime, endTime } = req.body;
    
    // Set date to today if not provided
    const date = new Date().toISOString().split('T')[0];
    
    const history = new History({
      action,
      details,
      duration,
      startTime,
      endTime,
      date,
    });
    
    await history.save();
    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create history entry' });
  }
};
