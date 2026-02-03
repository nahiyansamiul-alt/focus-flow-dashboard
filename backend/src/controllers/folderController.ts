import { Request, Response } from 'express';
import { allAsync, runAsync, getAsync } from '../database';

export const getFolders = async (_req: Request, res: Response) => {
  try {
    const folders = await allAsync('SELECT * FROM folders ORDER BY createdAt DESC');
    // Add _id field for frontend compatibility
    const mapped = folders.map(f => ({ ...f, _id: f.id }));
    res.json(mapped);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch folders' });
  }
};

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    
    const result = await runAsync(
      `INSERT INTO folders (name, color, createdAt, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [name, color || null]
    );
    
    const folder = await getAsync('SELECT * FROM folders WHERE id = ?', [result.id]);
    res.status(201).json({ ...folder, _id: folder.id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create folder' });
  }
};

export const updateFolder = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    
    await runAsync(
      `UPDATE folders SET name = ?, color = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, color || null, req.params.id]
    );
    
    const folder = await getAsync('SELECT * FROM folders WHERE id = ?', [req.params.id]);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.json({ ...folder, _id: folder.id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update folder' });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const folder = await getAsync('SELECT * FROM folders WHERE id = ?', [req.params.id]);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Delete all notes and todos in this folder (cascade delete)
    await runAsync('DELETE FROM notes WHERE folderId = ?', [req.params.id]);
    await runAsync('DELETE FROM todos WHERE folderId = ?', [req.params.id]);
    await runAsync('DELETE FROM folders WHERE id = ?', [req.params.id]);
    
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete folder' });
  }
};
