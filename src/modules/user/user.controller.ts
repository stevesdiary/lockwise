import { Request, Response } from 'express';
import { userService } from './user.service';

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
    const response = await userService.createUser(req.body);
    return res.status(response.statusCode).json(response);
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
