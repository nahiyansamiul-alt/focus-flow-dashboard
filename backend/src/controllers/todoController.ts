import { Request, Response } from 'express';
import { allAsync, runAsync, getAsync } from '../database';

export const getTodos = async (_req: Request, res: Response) => {
  try {
    const todos = await allAsync('SELECT * FROM todos ORDER BY createdAt DESC');
    // Add _id field for frontend compatibility
    const mapped = todos.map(t => ({ ...t, _id: t.id }));
    res.json(mapped);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch todos' });
  }
};

export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, description, completed, priority, dueDate, folderId, repeatType, repeatInterval, repeatDays, repeatLimit, repeatEndDate } = req.body;
    
    const result = await runAsync(
      `INSERT INTO todos (title, description, completed, priority, dueDate, folderId, repeatType, repeatInterval, repeatDays, repeatLimit, repeatEndDate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        title, 
        description || null, 
        completed ? 1 : 0, 
        priority || 'medium', 
        dueDate || null, 
        folderId || null,
        repeatType || 'none',
        repeatInterval || null,
        repeatDays ? JSON.stringify(repeatDays) : null,
        repeatLimit || null,
        repeatEndDate || null
      ]
    );
    
    const todo = await getAsync('SELECT * FROM todos WHERE id = ?', [result.id]);
    res.status(201).json({ ...todo, _id: todo.id });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(400).json({ error: 'Failed to create todo' });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const todoId = req.params.id;
    
    // Get current todo to preserve existing fields
    const currentTodo = await getAsync('SELECT * FROM todos WHERE id = ?', [todoId]);
    if (!currentTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const { title, description, completed, priority, dueDate, folderId, repeatType, repeatInterval, repeatDays, repeatLimit, repeatCount, repeatEndDate } = req.body;
    
    // Use provided values or fallback to current values
    const finalTitle = title !== undefined ? title : currentTodo.title;
    const finalDescription = description !== undefined ? description : currentTodo.description;
    const finalCompleted = completed !== undefined ? (completed ? 1 : 0) : currentTodo.completed;
    const finalPriority = priority !== undefined ? priority : (currentTodo.priority || 'medium');
    const finalDueDate = dueDate !== undefined ? dueDate : currentTodo.dueDate;
    const finalFolderId = folderId !== undefined ? folderId : currentTodo.folderId;
    const finalRepeatType = repeatType !== undefined ? repeatType : (currentTodo.repeatType || 'none');
    const finalRepeatInterval = repeatInterval !== undefined ? repeatInterval : currentTodo.repeatInterval;
    const finalRepeatDays = repeatDays !== undefined ? JSON.stringify(repeatDays) : currentTodo.repeatDays;
    const finalRepeatLimit = repeatLimit !== undefined ? repeatLimit : currentTodo.repeatLimit;
    const finalRepeatCount = repeatCount !== undefined ? repeatCount : (currentTodo.repeatCount || 0);
    const finalRepeatEndDate = repeatEndDate !== undefined ? repeatEndDate : currentTodo.repeatEndDate;
    
    await runAsync(
      `UPDATE todos SET title = ?, description = ?, completed = ?, priority = ?, dueDate = ?, folderId = ?, repeatType = ?, repeatInterval = ?, repeatDays = ?, repeatLimit = ?, repeatCount = ?, repeatEndDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        finalTitle,
        finalDescription || null,
        finalCompleted,
        finalPriority,
        finalDueDate || null,
        finalFolderId || null,
        finalRepeatType,
        finalRepeatInterval || null,
        finalRepeatDays || null,
        finalRepeatLimit || null,
        finalRepeatCount,
        finalRepeatEndDate || null,
        todoId
      ]
    );
    
    const todo = await getAsync('SELECT * FROM todos WHERE id = ?', [todoId]);
    res.json({ ...todo, _id: todo.id });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(400).json({ error: 'Failed to update todo' });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    await runAsync('DELETE FROM todos WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete todo' });
  }
};
