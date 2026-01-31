import Note from '../models/Note';
import { Request, Response } from 'express';

export const getNotes = async (_req: Request, res: Response) => {
  try {
    const notes = await Note.find().populate('folderId').sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch notes' });
  }
};

export const getNotesByFolder = async (req: Request, res: Response) => {
  try {
    const notes = await Note.find({ folderId: req.params.folderId })
      .populate('folderId')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch notes' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    // Validate that folderId is provided
    if (!req.body.folderId) {
      return res.status(400).json({ error: 'folderId is required' });
    }
    
    const note = new Note(req.body);
    await note.save();
    await note.populate('folderId');
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true }
    ).populate('folderId');
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update note' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete note' });
  }
};
