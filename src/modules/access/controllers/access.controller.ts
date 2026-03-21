import { Request, Response } from 'express';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';
import accessLogService from '../services/access-log.service';

// Create access request
async function createAccessRecord(req: Request, res: Response) {
  try {
    const user_id = req.user!.id;
    const estate_id = req.user!.estate_id;
    const { scheduled_entry_date, scheduled_exit_date, vehicle_number, remarks, is_multi_entry, max_entries, access_type, valid_from, valid_until } = req.body;
    
    // For unlimited entry types, set is_multi_entry to true automatically
    const unlimitedTypes = ['domestic_staff', 'service', 'maintenance'];
    const shouldAllowUnlimited = unlimitedTypes.includes(access_type);
    
    const accessLog = await accessLogService.createAccessRequest({
      user_id,
      estate_id,
      scheduled_entry_date,
      scheduled_exit_date,
      vehicle_number,
      remarks,
      access_type,
      valid_from: valid_from || scheduled_entry_date,
      valid_until: valid_until || scheduled_exit_date,
      is_multi_entry: shouldAllowUnlimited ? true : (is_multi_entry || false),
      max_entries: shouldAllowUnlimited ? null : (max_entries || (is_multi_entry ? 1 : undefined)),
      created_by: req.user?.id
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Access request created successfully',
      data: accessLog
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Record visitor entry (legacy - for backward compatibility)
async function recordEntry(req: Request, res: Response) {
  try {
    const accessId = req.params.accessId || req.body.access_id;
    const { gate_id, scanned_by } = req.body;

    if (!accessId) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID is required'
      });
    }

    await accessLogService.logEntry({ 
      access_id: accessId, 
      gate_id, 
      scanned_by: scanned_by || req.user?.id 
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Entry recorded successfully'
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Record visitor exit (legacy - for backward compatibility)
async function recordExit(req: Request, res: Response) {
  try {
    const accessId = req.params.accessId || req.body.access_id;

    if (!accessId) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID is required'
      });
    }

    await accessLogService.logExit(accessId);
    
    return res.status(200).json({
      status: 'success',
      message: 'Exit recorded successfully'
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Process code scan with entry limit validation
async function processCodeScan(req: Request, res: Response) {
  try {
    const { code, gate_id, scanned_by } = req.body;

    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: 'Access code is required'
      });
    }

    const result = await accessLogService.processCodeScan(
      code,
      gate_id,
      scanned_by || req.user?.id
    );

    return res.status(200).json({
      status: 'success',
      message: `${result.action.charAt(0).toUpperCase() + result.action.slice(1)} processed successfully`,
      data: {
        action: result.action,
        accessLog: result.accessLog,
        entry: result.entry
      }
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// // Get entry statistics for an access log
// async function getEntryStatistics(req: Request, res: Response) {
//   try {
//     const accessId = req.params.accessId;

//     if (!accessId) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Access ID is required'
//       });
//     }

//     const statistics = await accessLogService.getEntryStatistics(accessId);

//     return res.status(200).json({
//       status: 'success',
//       data: statistics
//     });
//   } catch (error) {
//     return handleControllerError(error, res);
//   }
// }

// Approve access request
async function approveAccess(req: Request, res: Response) {
  try {
    const accessId = req.params.accessId;
    const approvedBy = req.user?.id;

    if (!accessId || !approvedBy) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID and approver ID are required'
      });
    }

    await accessLogService.approveAccess({ 
      access_id: accessId, 
      approved_by: approvedBy 
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Access approved successfully'
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Revoke access request
async function revokeAccess(req: Request, res: Response) {
  try {
    const accessId = req.params.accessId as string;
    const revokedBy = req.user?.id;

    if (!accessId || !revokedBy) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID and revoker ID are required'
      });
    }

    await accessLogService.revokeAccess(accessId, revokedBy);
    
    return res.status(200).json({
      status: 'success',
      message: 'Access revoked successfully'
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Get all access logs
async function getAllAccess(req: Request, res: Response) {
  try {
    const { estate_id, user_id, status, limit, offset } = req.query;
    
    const accessLogs = await accessLogService.getAccessLogs({
      estate_id: (typeof estate_id === 'string' ? estate_id : undefined) || req.user?.estate_id,
      user_id: typeof user_id === 'string' ? user_id : undefined,
      status: typeof status === 'string' ? status : undefined,
      limit: limit && typeof limit === 'string' ? parseInt(limit) : undefined,
      offset: offset && typeof offset === 'string' ? parseInt(offset) : undefined
    });
    
    return res.status(200).json({
      status: 'success',
      data: accessLogs
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Get active access for user
async function getActiveAccess(req: Request, res: Response) {
  try {
    const { user_id, estate_id } = req.query;
    
    if (!user_id || !estate_id) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and Estate ID are required'
      });
    }

    const activeAccess = await accessLogService.getActiveAccess({ 
      user_id: typeof user_id === 'string' ? user_id : '', 
      estate_id: typeof estate_id === 'string' ? estate_id : '' 
    });
    
    return res.status(200).json({
      status: 'success',
      data: activeAccess
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
}

export {
  createAccessRecord,
  recordEntry,
  recordExit,
  processCodeScan,
  approveAccess,
  revokeAccess,
  getAllAccess,
  getActiveAccess
};
