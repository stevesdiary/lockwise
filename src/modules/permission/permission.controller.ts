import { Request as ExpressRequest, Response } from 'express';

import { createPermissionSchema } from '../../utils/validator';

import PermissionService  from './permission.service';
import { handleControllerError } from '../../middlewares/error.handler';
// import permissionController from './permission.controller';

export class PermissionController {
  async createPermission(req: ExpressRequest, res: Response): Promise<Response> {
    try {
      const permissionData = await createPermissionSchema.validate(req.body, {
        abortEarly: false
      });

      const newPermission = await PermissionService.createPermission(permissionData);
      return res.status(201).json({
        status: 'success',
        message: 'Permission created successfully',
        data: newPermission
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getAllPermissions(req: ExpressRequest, res: Response): Promise<Response> {
    try {
      const permissions = await PermissionService.getAllPermissions();
      return res.status(200).json({
        status: 'success',
        message: 'Permissions retrieved successfully',
        data: permissions
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
  
  async getPermissionById(req: ExpressRequest, res: Response): Promise<Response> {
    const permissionId = req.params.id;
    if (!permissionId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Permission ID is required'
      });
    }

    try {
      const permission = await PermissionService.getOnePermission(permissionId);
      if (!permission) {
        return res.status(404).json({
          status: 'fail',
          message: 'Permission not found'
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Permission retrieved successfully',
        data: permission
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async updatePermission(req: ExpressRequest, res: Response): Promise<Response> {
    const permissionId = req.params.id;
    if (!permissionId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Permission ID is required'
      });
    }

    try {
      const updatedPermission = await PermissionService.updatePermission(permissionId, req.body);
      if (!updatedPermission) {
        return res.status(404).json({
          status: 'fail',
          message: 'Permission not found'
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Permission updated successfully',
        data: updatedPermission
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async deletePermission(req: ExpressRequest, res: Response): Promise<Response> {
    const permissionId = req.params.id;
    if (!permissionId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Permission ID is required'
      });
    }

    try {
      const deleted = await PermissionService.deletePermission(permissionId);
      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message: 'Permission not found'
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Permission deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}

// export default PermissionController;