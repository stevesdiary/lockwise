import { Request, Response } from 'express';
import bulkUploadService from '../services/bulk-upload.service';
import fileUploadService from '../services/file-upload.service';
import { asyncHandler } from '../../../shared/middleware/error-handler.middleware';
import { asString } from '../../../shared/utils/param.util';

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

    const result = await bulkUploadService.uploadResidents(req.file.buffer, req.file.originalname, req.user?.id);

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

  uploadStreetsUnits: asyncHandler(async (req: BulkUploadRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file provided' });
    }

    const { estateId } = req.body;
    if (!estateId) {
      return res.status(400).json({ status: 'error', message: 'estateId is required' });
    }

    if (!bulkUploadService.validateFileFormat(req.file.originalname)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file format. Only .xlsx, .xls, and .csv are allowed',
      });
    }

    // Managers can only upload to their own estate; admins/super_admins can upload to any
    const userRole = (req.user!.role as string)?.toLowerCase() || '';
    const isAdmin = ['master', 'super_admin', 'admin'].includes(userRole);
    if (!isAdmin && req.user!.estate_id !== estateId) {
      return res.status(403).json({ status: 'error', message: 'You can only upload to your own estate' });
    }

    const result = await bulkUploadService.uploadStreetsUnits(
      req.file.buffer,
      req.file.originalname,
      estateId,
      req.user!.id
    );

    return res.status(200).json({
      status: 'success',
      message: 'Bulk streets/units upload completed',
      data: {
        totalProcessed: result.totalProcessed,
        successCount: result.successCount,
        streetsCreated: result.streetsCreated,
        unitsCreated: result.unitsCreated,
        skippedCount: result.skippedCount,
        errorCount: result.errors.length,
        errors: result.errors,
      },
    });
  }),

  getUploadTemplate: asyncHandler(async (req: Request, res: Response) => {
    const type = asString(req.params.type);
    
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
      },
      'streets-units': {
        headers: ['street_name', 'unit_identifier', 'unit_type', 'block', 'floor'],
        sample: ['Main Street', 'A101', 'flat', 'A', '1'],
      }
    };

    const template = templates[type as keyof typeof templates];
    if (!template) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid template type. Use: estates, residents, addresses, or streets-units'
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
          addresses: 'Street, Apartment, City, State, and Country are required. Available should be true/false',
          'streets-units': 'street_name and unit_identifier are required. unit_type must be one of: flat, duplex, chalet, terrace, plot, house, apartment, other (defaults to flat if blank)',
        }[type]
      }
    });
  })
};

export default bulkUploadController;