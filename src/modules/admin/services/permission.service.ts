import { PermissionCreationAttributes, PermissionAttributes } from '../types/permission.types';
import { Permission, PermissionRepository } from '../../auth';

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

  async updatePermission(id: string, data: Partial<PermissionAttributes>): Promise<Permission | null> {
    return this.permissionRepository.update(id, data);
  }

  async deletePermission(id: string): Promise<boolean> {
    return this.permissionRepository.delete(id);
  }
}
export default new PermissionService();
