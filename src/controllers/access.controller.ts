import { Request, Response } from 'express';
import { handleControllerError } from '../middlewares/error.handler';
import { accessService } from '../services/access';
import { createAccessSchema, entryOperationSchema, exitOperationSchema } from '../utils/validator';
import { EntryOperation, ExitOperation } from '../types/access.type';

// Create access record
async function createAccessRecord(req: Request, res: Response) {
  try {
    const validatedAccessData = await createAccessSchema.validate(req.body, { abortEarly: false });
    if (!validatedAccessData) {
      throw new Error('Input data is required');
    }
    const result = await accessService.createAccess(validatedAccessData);
    
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Record visitor entry
async function recordEntry(req: Request, res: Response) {
  try {
    const entryData: EntryOperation = {
      access_id: req.params.accessId || req.body.access_id,
      scanned_by: req.body.scanned_by || req.user?.id,
      gate_id: req.body.gate_id,
      remarks: req.body.remarks
    };

    if (!entryData.access_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID is required',
        statusCode: 400
      });
    }

    const result = await accessService.recordEntry(entryData);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Record visitor exit
async function recordExit(req: Request, res: Response) {
  try {
    const exitData: ExitOperation = {
      entry_id: req.params.entryId || req.body.entry_id,
      scanned_by: req.body.scanned_by || req.user?.id,
      gate_id: req.body.gate_id,
      remarks: req.body.remarks
    };

    if (!exitData.entry_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Entry ID is required',
        statusCode: 400
      });
    }

    const result = await accessService.recordExit(exitData);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Get access with all entries
async function getAccessWithEntries(req: Request, res: Response) {
  try {
    const accessId = req.params.accessId;
    if (!accessId) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID is required',
        statusCode: 400
      });
    }

    const result = await accessService.getAccessWithEntries(accessId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Get active entries for an access
async function getActiveEntries(req: Request, res: Response) {
  try {
    const accessId = req.params.accessId;
    if (!accessId) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID is required',
        statusCode: 400
      });
    }

    const result = await accessService.getActiveEntries(accessId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Check if visitor can enter
async function checkEntryPermission(req: Request, res: Response) {
  try {
    const accessId = req.params.accessId;
    if (!accessId) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID is required',
        statusCode: 400
      });
    }

    const result = await accessService.canVisitorEnter(accessId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Legacy check-in method (for backward compatibility)
async function checkInVisitor(req: Request, res: Response) {
  try {
    const { access_id, remarks } = req.body;
    const approver_id = req.user?.id;

    if (!access_id || !approver_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID and approver ID are required',
        statusCode: 400
      });
    }

    const result = await accessService.checkInVisitor(access_id, approver_id, remarks);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Legacy check-out method (for backward compatibility)
async function checkOutVisitor(req: Request, res: Response) {
  try {
    const { access_id } = req.body;
    const approver_id = req.user?.id;

    if (!access_id || !approver_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID and approver ID are required',
        statusCode: 400
      });
    }

    const result = await accessService.checkOutVisitor(access_id, approver_id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Get all access logs
async function getAllAccess(req: Request, res: Response) {
  try {
    const estate_id = req.query.estate_id as string || req.user?.estate_id;
    
    const result = await accessService.getAccesss(estate_id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return handleControllerError(error, res);
  }
}

// Get single access log
async function getOneAccess(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Access ID is required',
        statusCode: 400
      });
    }

    const result = await accessService.getOnelog(id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return handleControllerError(error, res);
  }
}

export {
  createAccessRecord,
  recordEntry,
  recordExit,
  getAccessWithEntries,
  getActiveEntries,
  checkEntryPermission,
  checkInVisitor,
  checkOutVisitor,
  getAllAccess,
  getOneAccess
};
