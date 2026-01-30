import Folder from '../models/Folder';
import { Request, Response } from 'express';

export const getFolders = async (_req: Request, res: Response) => {
  const folders = await Folder.find();
  res.json(folders);
};

export const createFolder = async (req: Request, res: Response) => {
  const folder = new Folder(req.body);
  await folder.save();
  res.status(201).json(folder);
};
