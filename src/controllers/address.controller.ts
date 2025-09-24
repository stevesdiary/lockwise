import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { handleControllerError } from '../middlewares/error.handler';
import addressUploadService from '../services/address.upload.service';

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req: Request, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

class AddressController {
  uploadMiddleware = upload.single('addressFile');

  async uploadAddresses(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'fail',
          message: 'No file uploaded'
        });
      }

      const estateId = req.user?.estateId;
      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const result = await addressUploadService.uploadAddressesFromFile(
        req.file.path,
        estateId
      );

      return res.status(200).json({
        status: 'success',
        message: 'Addresses uploaded successfully',
        data: {
          totalProcessed: result.totalProcessed,
          addressesCreated: result.addressesCreated.length,
          errors: result.errors.length,
          errorDetails: result.errors
        }
      });

    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new AddressController();