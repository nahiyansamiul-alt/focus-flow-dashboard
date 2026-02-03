import { Request, Response } from 'express';
import { allAsync, runAsync, getAsync } from '../database';

export const getSessions = async (_req: Request, res: Response) => {
  try {
    const sessions = await allAsync('SELECT * FROM sessions ORDER BY date DESC');
    // Add _id field for frontend compatibility
    const mapped = sessions.map(s => ({ ...s, _id: s.id }));
    res.json(mapped);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch sessions' });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const { date, startTime, endTime, duration } = req.body;
    
    const result = await runAsync(
      `INSERT INTO sessions (date, startTime, endTime, duration, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [date, startTime, endTime, duration]
    );
    
    const session = await getAsync('SELECT * FROM sessions WHERE id = ?', [result.id]);
    res.status(201).json({ ...session, _id: session.id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create session' });
  }
};
