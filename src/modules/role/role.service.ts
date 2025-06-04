import { RoleRepository } from "../repositories/role.repository";
import { Role } from "./role.model";
import { RoleCreationAttributes, RoleUpdateAttributes } from "../../types/role.type";

export class RoleService {
  private roleRepository: RoleRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
  }

  async createRole(data: RoleCreationAttributes): Promise<Role> {
    return this.roleRepository.create(data);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async getOneRole(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  async updateRole(id: string, data: RoleUpdateAttributes): Promise<Role | null> {
    return this.roleRepository.update(id, data);
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.roleRepository.delete(id);
  }
}
