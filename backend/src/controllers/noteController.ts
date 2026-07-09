import { Request, Response } from 'express';
import { allAsync, runAsync, getAsync } from '../database';

export const getNotes = async (_req: Request, res: Response) => {
  try {
    const notes = await allAsync('SELECT * FROM notes ORDER BY createdAt DESC');
    // Add _id field for frontend compatibility
    const mapped = notes.map(n => ({ ...n, _id: n.id }));
    res.json(mapped);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch notes' });
  }
};

export const getNotesByFolder = async (req: Request, res: Response) => {
  try {
    const notes = await allAsync(
      'SELECT * FROM notes WHERE folderId = ? ORDER BY createdAt DESC',
      [req.params.folderId]
    );
    // Add _id field for frontend compatibility
    const mapped = notes.map(n => ({ ...n, _id: n.id }));
    res.json(mapped);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch notes' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content, folderId } = req.body;
    
    if (!folderId) {
      return res.status(400).json({ error: 'folderId is required' });
    }
    
    const result = await runAsync(
      `INSERT INTO notes (title, content, folderId, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [title, content || null, folderId]
    );
    
    const note = await getAsync('SELECT * FROM notes WHERE id = ?', [result.id]);
    res.status(201).json({ ...note, _id: note.id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.id;

    // Get current note first
    const currentNote = await getAsync('SELECT * FROM notes WHERE id = ?', [noteId]);
    if (!currentNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Only update fields that were provided
    const { title, content, folderId } = req.body;
    const finalTitle = title !== undefined ? title : currentNote.title;
    const finalContent = content !== undefined ? content : currentNote.content;
    const finalFolderId = folderId !== undefined ? folderId : currentNote.folderId;

    await runAsync(
      `UPDATE notes SET title = ?, content = ?, folderId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [finalTitle, finalContent, finalFolderId, noteId]
    );
    
    const note = await getAsync('SELECT * FROM notes WHERE id = ?', [noteId]);
    res.json({ ...note, _id: note.id });
  } catch (error) {
    console.error('[noteController.updateNote] Error updating note:', error);
    res.status(400).json({ error: 'Failed to update note' });
  }
};

export const markNoteViewed = async (req: Request, res: Response) => {
  try {
    await runAsync('UPDATE notes SET lastViewedAt = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to mark note viewed' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const note = await getAsync('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await runAsync('DELETE FROM notes WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete note' });
  }
};
