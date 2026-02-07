import { Role } from "../../auth/models/role.model";
import { Permission } from "../../auth/models/permission.model";

type ApiResponse<T> = {
  status: 'success' | 'fail';
  statusCode: number;
  message: string;
  data: T;
};

export class RoleService {

  async createRole(data: any): Promise<ApiResponse<Role>> {
    try {
      const existingRole = await Role.findOne({ where: { role: data.role } });
      if (existingRole) {
        return {
          status: 'fail',
          statusCode: 409,
          message: 'Role already exists',
          data: null as any
        };
      }

      const role = await Role.create(data);
      return {
        status: 'success',
        statusCode: 201,
        message: 'Role created successfully',
        data: role
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const roles = await Role.findAll({
        include: [{ 
          model: Permission, 
          as: 'permissions',
          through: { attributes: [] }
        }]
      });
      return {
        status: 'success',
        statusCode: 200,
        message: 'Roles with permissions retrieved successfully',
        data: roles
      };
    } catch (error) {
      throw error;
    }
  }

  async getOneRole(id: string): Promise<ApiResponse<Role | null>> {
    try {
      const role = await Role.findByPk(id, {
        include: [{ model: Permission, as: 'permissions' }]
      });
      return {
        status: role ? 'success' : 'fail',
        statusCode: role ? 200 : 404,
        message: role ? 'Role retrieved successfully' : 'Role not found',
        data: role
      };
    } catch (error) {
      throw error;
    }
  }

  async updateRole(id: string, data: any): Promise<ApiResponse<Role | null>> {
    try {
      const role = await Role.findByPk(id);
      if (!role) {
        return {
          status: 'fail',
          statusCode: 404,
          message: 'Role not found',
          data: null
        };
      }

      await role.update(data);
      return {
        status: 'success',
        statusCode: 200,
        message: 'Role updated successfully',
        data: role
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteRole(id: string): Promise<ApiResponse<null>> {
    try {
      const deleted = await Role.destroy({ where: { id } });
      return {
        status: deleted > 0 ? 'success' : 'fail',
        statusCode: deleted > 0 ? 200 : 404,
        message: deleted > 0 ? 'Role deleted successfully' : 'Role not found',
        data: null
      };
    } catch (error) {
      throw error;
    }
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<ApiResponse<null>> {
    try {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return {
          status: 'fail',
          statusCode: 404,
          message: 'Role not found',
          data: null
        };
      }

      // Create role-permission associations
      const { RolePermission } = require('../models/role.permission.model');
      const associations = permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }));
      
      await RolePermission.bulkCreate(associations, { ignoreDuplicates: true });
      
      return {
        status: 'success',
        statusCode: 200,
        message: 'Permissions assigned successfully',
        data: null
      };
    } catch (error) {
      throw error;
    }
  }
}
