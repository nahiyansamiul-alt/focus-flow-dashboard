import Note from '../models/Note';
import { Request, Response } from 'express';

export const getNotes = async (_req: Request, res: Response) => {
  const notes = await Note.find();
  res.json(notes);
};

export const createNote = async (req: Request, res: Response) => {
  const note = new Note(req.body);
  await note.save();
  res.status(201).json(note);
};

export const updateNote = async (req: Request, res: Response) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(note);
};

export const deleteNote = async (req: Request, res: Response) => {
  await Note.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
