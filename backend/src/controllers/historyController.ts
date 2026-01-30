import History from '../models/History';
import { Request, Response } from 'express';

export const getHistory = async (_req: Request, res: Response) => {
  const history = await History.find();
  res.json(history);
};

export const createHistory = async (req: Request, res: Response) => {
  const history = new History(req.body);
  await history.save();
  res.status(201).json(history);
};
