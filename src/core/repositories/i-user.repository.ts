import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

// UserWithRole tipini tanımlayalım (Basitçe User entity'sini genişletir)
export type UserWithRole = User & { role?: Role | null };

// Soyutlama (Abstraction)
export interface IUserRepository {
  create(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: number, user: Partial<User>): Promise<User>;
  
  // Soft Delete (Tarih atarak silme)
  delete(id: number): Promise<void>;

  findByIdWithPermissions(id: number): Promise<UserWithRole | null>;

  // Additional methods for filtering and searching
  findByRole(roleId: number): Promise<User[]>;
  searchUsers(searchTerm: string, roleId?: number, isActive?: boolean): Promise<User[]>;
  count(): Promise<number>;
}

// NestJS Dependency Injection için Token
export const IUserRepository = Symbol('IUserRepository');