import { PermissionCreationAttributes, PermissionUpdateAttributes } from '../types/permission.type';
import { Permission } from '../models/permission.model';
import { PermissionRepository } from '../repositories/permission.repository';

class PermissionService {
  private permissionRepository: PermissionRepository;

  constructor() {
    this.permissionRepository = new PermissionRepository();
  }

  async createPermission(data: PermissionCreationAttributes): Promise<Permission> {
    return this.permissionRepository.create(data);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  async getOnePermission(id: string): Promise<Permission | null> {
    return this.permissionRepository.findById(id);
  }

  async updatePermission(id: string, data: Partial<PermissionUpdateAttributes>): Promise<Permission | null> {
    return this.permissionRepository.update(id, data);
  }

  async deletePermission(id: string): Promise<boolean> {
    return this.permissionRepository.delete(id);
  }
}
export default new PermissionService();
// This service handles CRUD operations for permissions, leveraging the PermissionRepository for database interactions.
