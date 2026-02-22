import { Request as ExpressRequest, Response } from "express";
import { RoleService } from "../services/role.service";
import { asString } from '../../../shared/utils/param.util';

const roleService = new RoleService();
const RoleController = {
  create: async (req: ExpressRequest, res: Response): Promise<Response> => {
    try {
      const roleData = req.body;
      if (!roleData) {
        return res.status(400).json({
          status: "error",
          message: "Role data is required",
        });
      }
      const newRole = await roleService.createRole(roleData);
      return res.json(newRole);
    } catch (error) {
      console.error("Error creating role:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to create role",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  getAllRoles: async (req: ExpressRequest, res: Response): Promise<Response> => {
    try {
      const roles = await roleService.getAllRoles();
      return res.json(roles);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve roles",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  getRoleById: async (req: ExpressRequest, res: Response): Promise<Response> => {
    try {
      const roleId = asString(req.params.roleId);
      if (!roleId) {
        return res.status(400).json({
          status: "error",
          message: "Role ID is required",
        });
      }
      const role = await roleService.getOneRole(roleId);
      if (!role) {
        return res.status(404).json({
          status: "error",
          message: "Role not found",
        });
      }
      return res.json(role);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve role",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  updateRole: async (req: ExpressRequest, res: Response): Promise<Response> => {
    try {
      const roleId = asString(req.params.roleId);
      const roleData = req.body;
      if (!roleId || !roleData) {
        return res.status(400).json({
          status: "error",
          message: "Role ID and data are required",
        });
      }
      const updatedRole = await roleService.updateRole(roleId, roleData);
      if (!updatedRole) {
        return res.status(404).json({
          status: "error",
          message: "Role not found",
        });
      }
      return res.json(updatedRole);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to update role",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  deleteRole: async (req: ExpressRequest, res: Response): Promise<Response> => {
    try {
      const roleId = asString(req.params.roleId);
      if (!roleId) {
        return res.status(400).json({
          status: "error",
          message: "Role ID is required",
        });
      }
      const deletedRole = await roleService.deleteRole(roleId);
      if (!deletedRole) {
        return res.status(404).json({
          status: "error",
          message: "Role not found",
        });
      }
      return res.json({
        status: "success",
        message: "Role deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to delete role",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
  assignPermissions: async (req: ExpressRequest, res: Response): Promise<Response> => {
    try {
      const roleId = asString(req.params.roleId);
      const { permission_ids } = req.body;
      
      if (!roleId || !permission_ids) {
        return res.status(400).json({
          status: "error",
          message: "Role ID and permission IDs are required",
        });
      }
      
      const result = await roleService.assignPermissions(roleId, permission_ids);
      return res.json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "error",
        message: "Failed to assign permissions",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
}
export default RoleController;