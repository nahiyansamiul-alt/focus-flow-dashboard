import Session from '../models/Session';
import { Request, Response } from 'express';

export const getSessions = async (_req: Request, res: Response) => {
  const sessions = await Session.find();
  res.json(sessions);
};

export const createSession = async (req: Request, res: Response) => {
  const session = new Session(req.body);
  await session.save();
  res.status(201).json(session);
};
