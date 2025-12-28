import { Request, Response } from 'express';
import bulkUploadService from '../services/bulk-upload.service';
import fileUploadService from '../services/file-upload.service';
import { asyncHandler } from '../middlewares/error-handler.middleware';

interface BulkUploadRequest extends Request {
  file?: Express.Multer.File;
}

const bulkUploadController = {

  uploadEstates: asyncHandler(async (req: BulkUploadRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file provided'
      });
    }

    if (!bulkUploadService.validateFileFormat(req.file.originalname)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file format. Only Excel (.xlsx, .xls) and CSV files are allowed'
      });
    }

    const result = await bulkUploadService.uploadEstates(req.file.buffer, req.file.originalname, req.user?.id || 'unknown');

    return res.status(200).json({
      status: 'success',
      message: 'Bulk estate upload completed',
      data: {
        totalProcessed: result.totalProcessed,
        successCount: result.successCount,
        createdCount: result.created.length,
        skippedCount: result.skipped.length,
        errorCount: result.errors.length,
        created: result.created,
        skipped: result.skipped,
        errors: result.errors
      }
    });
  }),

  uploadResidents: asyncHandler(async (req: BulkUploadRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file provided'
      });
    }

    if (!bulkUploadService.validateFileFormat(req.file.originalname)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file format. Only Excel (.xlsx, .xls) and CSV files are allowed'
      });
    }

    const result = await bulkUploadService.uploadResidents(req.file.buffer, req.file.originalname);

    return res.status(200).json({
      status: 'success',
      message: 'Bulk resident upload completed',
      data: {
        totalProcessed: result.totalProcessed,
        successCount: result.successCount,
        errorCount: result.errors.length,
        created: result.created,
        errors: result.errors
      }
    });
  }),

  uploadAddresses: asyncHandler(async (req: BulkUploadRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file provided'
      });
    }

    const { estateId } = req.body;
    if (!estateId) {
      return res.status(400).json({
        status: 'error',
        message: 'Estate ID is required'
      });
    }

    if (!bulkUploadService.validateFileFormat(req.file.originalname)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file format. Only Excel (.xlsx, .xls) and CSV files are allowed'
      });
    }

    const result = await bulkUploadService.uploadAddresses(
      req.file.buffer, 
      req.file.originalname, 
      estateId
    );

    return res.status(200).json({
      status: 'success',
      message: 'Bulk address upload completed',
      data: {
        totalProcessed: result.totalProcessed,
        successCount: result.successCount,
        errorCount: result.errors.length,
        created: result.created,
        errors: result.errors,
        estateId
      }
    });
  }),

  getUploadTemplate: asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.params;
    
    const templates = {
      estates: {
        headers: ['Name', 'Address', 'Type', 'City', 'State', 'Country', 'Estate Code', 'Apartments', 'Floors'],
        sample: ['Sunset Gardens', '123 Main St', 'residential', 'Lagos', 'Lagos', 'Nigeria', 'SG001', '50', '10']
      },
      residents: {
        headers: ['User ID', 'Estate ID', 'Unit ID', 'Move In Date', 'Lease Start', 'Lease End', 'Emergency Contact', 'Emergency Phone', 'Status'],
        sample: ['user_123', 'estate_456', 'unit_789', '2024-01-01', '2024-01-01', '2024-12-31', 'John Doe', '+2348012345678', 'active']
      },
      addresses: {
        headers: ['Street', 'Building', 'Apartment', 'City', 'State', 'Country', 'Zip', 'Available'],
        sample: ['Main Street', 'Block A', 'A101', 'Lagos', 'Lagos', 'Nigeria', '100001', 'true']
      }
    };

    const template = templates[type as keyof typeof templates];
    if (!template) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid template type. Use: estates, residents, or addresses'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        type,
        headers: template.headers,
        sampleData: template.sample,
        instructions: {
          estates: 'Name and Address are required. Type must be: residential, mixed, commercial, or other',
          residents: 'User ID, Estate ID, and Unit ID are required. Status must be: active, inactive, or pending',
          addresses: 'Street, Apartment, City, State, and Country are required. Available should be true/false'
        }[type]
      }
    });
  })
};

export default bulkUploadController;