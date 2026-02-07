import { Request, Response } from 'express';
import { User } from '../models/user.model';

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    await User.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};
