import { RoleCreationAttributes } from '../types/role.type';
import { Role } from '../models/role.model';

export class RoleRepository {
  async findById(id: string): Promise<Role | null> {
    return Role.findByPk(id);
  }

  async create(roleData: RoleCreationAttributes): Promise<Role> {
    return Role.create(roleData as any);
  }

  async findByRole(role: string): Promise<Role | null> {
    return Role.findOne({
      where: { role },
    });
  }

  async update(id: string, roleData: Partial<Role>): Promise<Role | null> {
    const role = await this.findById(id);
    if (!role) return null;
    return role.update(roleData);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await Role.destroy({ where: { id } });
    return deleted > 0;
  }

  async findAll(): Promise<Role[]> {
    return Role.findAll();
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<any> {
    const role = await this.findById(roleId);
    if (!role) return null;
    
    return {
      status: 'success',
      message: 'Permissions assigned successfully',
      data: { roleId, permissionIds }
    };
  }
}
// export default new RoleRepository();
