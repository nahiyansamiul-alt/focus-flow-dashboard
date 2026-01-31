import Folder from '../models/Folder';
import Note from '../models/Note';
import { Request, Response } from 'express';

export const getFolders = async (_req: Request, res: Response) => {
  const folders = await Folder.find().sort({ createdAt: -1 });
  res.json(folders);
};

export const createFolder = async (req: Request, res: Response) => {
  try {
    const folder = new Folder(req.body);
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create folder' });
  }
};

export const updateFolder = async (req: Request, res: Response) => {
  try {
    const folder = await Folder.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.json(folder);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update folder' });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const folder = await Folder.findByIdAndDelete(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Delete all notes in this folder (cascade delete)
    await Note.deleteMany({ folderId: req.params.id });
    
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete folder' });
  }
};
