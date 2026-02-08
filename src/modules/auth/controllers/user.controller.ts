import { Request, Response } from 'express';
import { User } from '../models/user.model';
import * as userService from '../services/user.service';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.registerUser(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUsers(req.query.estate_id as string);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.getUserById(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.deleteUser(req.body.estate_id, req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
