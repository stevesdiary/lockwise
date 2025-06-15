import { Request as ExpressRequest, Response } from 'express';
import { handleControllerError } from '../../middlewares/error.handler';
import { accessService } from './access.service';
import { abort } from 'process';
import { createAccessSchema } from '../../utils/validator'

async function createAccessRecord(req: Request, res: Response) {
  try {
    // const estate_id = req.user?.estate_id;
    const validatedAccessData = await createAccessSchema.validate( req.body, {abortEarly: false});
    if(!validatedAccessData) {
      throw new Error('input data is required');
    }
    const result = await accessService.createAccess(validatedAccessData);
    
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: (error as Error).message,
      statusCode: 500
    });
  }
}
