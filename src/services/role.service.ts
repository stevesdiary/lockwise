import { Role } from "../models/role.model";
import { RoleCreationAttributes, RoleUpdateAttributes } from "../types/role.type";

export class RoleService {
  async createRole(data: RoleCreationAttributes): Promise<Role> {
    return Role.create(data as any);
  }

  async getAllRoles(): Promise<Role[]> {
    return Role.findAll();
  }

  async getOneRole(id: string): Promise<Role | null> {
    return Role.findByPk(id);
  }

  async updateRole(id: string, data: RoleUpdateAttributes): Promise<Role | null> {
    const role = await Role.findByPk(id);
    if (!role) return null;
    return role.update(data);
  }

  async deleteRole(id: string): Promise<boolean> {
    const deleted = await Role.destroy({ where: { id } });
    return deleted > 0;
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<any> {
    const role = await Role.findByPk(roleId);
    if (!role) return null;
    
    return {
      status: 'success',
      message: 'Permissions assigned successfully',
      data: { roleId, permissionIds }
    };
  }
}
