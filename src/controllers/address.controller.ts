import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { handleControllerError } from '../middlewares/error.handler';
import addressUploadService from '../services/address.upload.service';
import mapService from '../services/map.service';

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

  async getEstateMap(req: Request, res: Response) {
    try {
      const estateId = req.user?.estateId || req.params.estateId;
      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const mapData = await mapService.getEstateMapData(estateId);
      if (!mapData) {
        return res.status(404).json({
          status: 'fail',
          message: 'Estate not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: mapData
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async updateAddressLocation(req: Request, res: Response) {
    try {
      const { addressId } = req.params;
      const updated = await mapService.updateAddressCoordinates(addressId);

      if (!updated) {
        return res.status(400).json({
          status: 'fail',
          message: 'Failed to update address coordinates'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Address coordinates updated successfully'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getDirections(req: Request, res: Response) {
    try {
      const { fromLat, fromLng, toLat, toLng } = req.query;
      
      if (!fromLat || !fromLng || !toLat || !toLng) {
        return res.status(400).json({
          status: 'fail',
          message: 'All coordinates (fromLat, fromLng, toLat, toLng) are required'
        });
      }

      const directionsUrl = mapService.generateDirectionsUrl(
        Number(fromLat), Number(fromLng), Number(toLat), Number(toLng)
      );

      return res.status(200).json({
        status: 'success',
        data: { directionsUrl }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new AddressController();