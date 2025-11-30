import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

export interface IRoleRepository {
  create(role: Role): Promise<Role>;
  findAll(): Promise<Role[]>;
  findById(id: number): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  update(id: number, role: Partial<Role>): Promise<Role>;
  delete(id: number): Promise<void>;
  
  // Rol Yetkilerini Yönetme
  assignPermissions(roleId: number, permissionIds: number[]): Promise<void>;
  getPermissions(roleId: number): Promise<Permission[]>;
}

export const IRoleRepository = Symbol('IRoleRepository');