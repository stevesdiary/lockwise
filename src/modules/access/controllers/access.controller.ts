import { Request, Response } from 'express';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';
import accessLogService from '../services/access-log.service';

// Create access request
async function createAccessRecord(req: Request, res: Response) {
  try {
    const user_id = req.user.id;
    const estate_id = req.user.estate_id;
    const { scheduled_entry_date, scheduled_exit_date, vehicle_number, remarks } = req.body;
    
    const accessLog = await accessLogService.createAccessRequest({
      user_id,
      estate_id,
      scheduled_entry_date,
      scheduled_exit_date,
      vehicle_number,
      remarks,
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

// Record visitor entry
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

// Record visitor exit
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

// Get all access logs
async function getAllAccess(req: Request, res: Response) {
  try {
    const { estate_id, user_id, status, limit, offset } = req.query;
    
    const accessLogs = await accessLogService.getAccessLogs({
      estate_id: estate_id as string || req.user?.estate_id,
      user_id: user_id as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
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
      user_id: user_id as string, 
      estate_id: estate_id as string 
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
  approveAccess,
  getAllAccess,
  getActiveAccess
};
