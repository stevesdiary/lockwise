import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { userRegistrationSchema } from '../utils/validator';

export const userController = {
  getUsersByEstate: async (req: Request, res: Response): Promise<Response> => {
    const estateId = req.user?.estate_id || req.query.estate_id as string;
    const response = await userService.getUsersByEstate(estateId);
    return res.status(response.statusCode).json(response);
  },

  getOneUser: async (req: Request, res: Response): Promise<Response> => {
    const response = await userService.getUserById(req.params.id);
    return res.status(response.statusCode).json(response);
  },

  register: async (req: Request, res: Response): Promise<Response> => {
    try {
      const validatedData = await userRegistrationSchema.validate(req.body, {abortEarly: false});
      const response = await userService.createUser(validatedData);
      return res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error('User registration error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message, errors: error.errors });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  updateUser: async (req: Request, res: Response): Promise<Response> => {
    const response = await userService.updateUser(req.params.id, req.body);
    return res.status(response.statusCode).json(response);
  },

  deleteUser: async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
    const estate_id = req.query.estate_id;
    if (typeof estate_id !== 'string' || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid parameter for estate_id' });
    }
    const response = await userService.deleteUser(estate_id, id);
    return res.status(response.statusCode).json(response);
  },

  verifyUser: async (req: Request, res: Response): Promise<Response> => {
    const { email, code } = req.body;
    const response = await userService.verifyUser({ email, code });
    return res.status(response.statusCode).json(response);
  }
};
