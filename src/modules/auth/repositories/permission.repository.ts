import { PermissionCreationAttributes } from "../types/permission.types";
import { Permission } from "../models/permission.model";

export class PermissionRepository {
  async findById(id: string): Promise<Permission | null> {
    return Permission.findByPk(id);
  }

  async create(permissionData: PermissionCreationAttributes): Promise<Permission> {
    return Permission.create(permissionData as any);
  }

  async findAll(): Promise<Permission[]> {
    return Permission.findAll();
  }

  async update(id: string, permissionData: Partial<Permission>): Promise<Permission | null> {
    const permission = await this.findById(id);
    if (!permission) return null;
    return permission.update(permissionData);

  }
  async delete(id: string): Promise<boolean> {
    const deleted = await Permission.destroy({ where: { id } });
    return deleted > 0;
  } 
  async findByName(name: string): Promise<Permission | null> {
    return Permission.findOne({
      where: { name },
    });
  }
}