import { Request, Response } from 'express';
import { allAsync, runAsync, getAsync } from '../database';

export const getReminders = async (_req: Request, res: Response) => {
  try {
    const reminders = await allAsync('SELECT * FROM reminders ORDER BY reminderDate DESC');
    // Map database fields to API response format
    const mapped = reminders.map(r => ({
      ...r,
      date: r.reminderDate ? (r.reminderTime ? `${r.reminderDate}T${r.reminderTime}` : r.reminderDate) : null,
      _id: r.id,
      id: r.id
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(400).json({ error: 'Failed to fetch reminders' });
  }
};

export const getRemindersByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const reminders = await allAsync(
      'SELECT * FROM reminders WHERE reminderDate = ? ORDER BY reminderTime ASC',
      [date]
    );
    // Map database fields to API response format
    const mapped = reminders.map(r => ({
      ...r,
      date: r.reminderDate ? (r.reminderTime ? `${r.reminderDate}T${r.reminderTime}` : r.reminderDate) : null,
      _id: r.id,
      id: r.id
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching reminders for date:', error);
    res.status(400).json({ error: 'Failed to fetch reminders for date' });
  }
};

export const createReminder = async (req: Request, res: Response) => {
  try {
    const { title, description, date, reminderDate, reminderTime, completed } = req.body;
    
    // Support both 'date' (from frontend API) and 'reminderDate'/'reminderTime' (from other sources)
    const finalDate = reminderDate || (date ? new Date(date).toISOString().split('T')[0] : null);
    const finalTime = reminderTime || (date ? new Date(date).toISOString().split('T')[1]?.substring(0, 5) : null);
    
    if (!finalDate) {
      return res.status(400).json({ error: 'reminderDate or date is required' });
    }
    
    const result = await runAsync(
      `INSERT INTO reminders (title, description, reminderDate, reminderTime, completed, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [title, description || null, finalDate, finalTime || null, completed ? 1 : 0]
    );
    
    const reminder = await getAsync('SELECT * FROM reminders WHERE id = ?', [result.id]);
    const mapped = {
      ...reminder,
      date: reminder.reminderDate ? (reminder.reminderTime ? `${reminder.reminderDate}T${reminder.reminderTime}` : reminder.reminderDate) : null,
      _id: reminder.id,
      id: reminder.id
    };
    res.status(201).json(mapped);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(400).json({ error: 'Failed to create reminder' });
  }
};

export const updateReminder = async (req: Request, res: Response) => {
  try {
    const { title, description, reminderDate, reminderTime, date, completed } = req.body;
    
    // Support both 'date' (from frontend API) and 'reminderDate'/'reminderTime' (from other sources)
    const finalDate = reminderDate || (date ? new Date(date).toISOString().split('T')[0] : undefined);
    const finalTime = reminderTime || (date ? new Date(date).toISOString().split('T')[1]?.substring(0, 5) : undefined);
    
    await runAsync(
      `UPDATE reminders SET title = ?, description = ?, reminderDate = COALESCE(?, reminderDate), reminderTime = COALESCE(?, reminderTime), completed = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [title, description || null, finalDate, finalTime, completed ? 1 : 0, req.params.id]
    );
    
    const reminder = await getAsync('SELECT * FROM reminders WHERE id = ?', [req.params.id]);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    // Map database fields to API response format
    const mapped = {
      ...reminder,
      date: reminder.reminderDate ? (reminder.reminderTime ? `${reminder.reminderDate}T${reminder.reminderTime}` : reminder.reminderDate) : null,
      _id: reminder.id,
      id: reminder.id
    };
    res.json(mapped);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(400).json({ error: 'Failed to update reminder' });
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const reminder = await getAsync('SELECT * FROM reminders WHERE id = ?', [req.params.id]);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    await runAsync('DELETE FROM reminders WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete reminder' });
  }
};
