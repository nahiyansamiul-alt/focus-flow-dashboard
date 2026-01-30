import Todo from '../models/Todo';
import { Request, Response } from 'express';

export const getTodos = async (_req: Request, res: Response) => {
  const todos = await Todo.find();
  res.json(todos);
};

export const createTodo = async (req: Request, res: Response) => {
  const todo = new Todo(req.body);
  await todo.save();
  res.status(201).json(todo);
};

export const updateTodo = async (req: Request, res: Response) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(todo);
};

export const deleteTodo = async (req: Request, res: Response) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
