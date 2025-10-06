import { Request, Response } from 'express';
import { handleControllerError } from '../middlewares/error.handler';
import AccessCodeService from '../services/access.code.service';
import idGenerator from '../utils/idGenerator';

class AccessCodeController {
  async generateCode(req: Request, res: Response) {
    try {
      const estateId = req.user?.estateId;
      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const code = await idGenerator.generateAccessCode(estateId);
      const category = await AccessCodeService.getCurrentCategory(estateId);

      return res.status(200).json({
        status: 'success',
        data: {
          accessCode: code,
          category: category || 'random'
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async generateCustomCode(req: Request, res: Response) {
    try {
      const { eventName } = req.body;
      if (!eventName) {
        return res.status(400).json({
          status: 'fail',
          message: 'Event name is required'
        });
      }

      const code = idGenerator.generateCustomAccessCode(eventName);

      return res.status(200).json({
        status: 'success',
        data: { accessCode: code }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async refreshCategory(req: Request, res: Response) {
    try {
      const estateId = req.user?.estateId;
      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      await AccessCodeService.refreshCategory(estateId);
      const newCategory = await AccessCodeService.getCurrentCategory(estateId);

      return res.status(200).json({
        status: 'success',
        data: { category: newCategory }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new AccessCodeController();