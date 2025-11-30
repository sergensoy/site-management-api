import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../core/repositories/i-role.repository';
import { Role } from '../../core/entities/role.entity';
import { Permission } from '../../core/entities/permission.entity';
import { PrismaService } from '../prisma/prisma.service';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class PrismaRoleRepository implements IRoleRepository {
  constructor(private prisma: PrismaService) {}

  async create(role: Role): Promise<Role> {
    const created = await this.prisma.role.create({
      data: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
      },
      include: { permissions: { include: { permission: true } } },
    });
    return RoleMapper.toDomain(created);
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
    return roles.map(RoleMapper.toDomain);
  }

  async findById(id: number): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    return role ? RoleMapper.toDomain(role) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
      include: { permissions: { include: { permission: true } } },
    });
    return role ? RoleMapper.toDomain(role) : null;
  }

  async update(id: number, roleData: Partial<Role>): Promise<Role> {
    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        name: roleData.name,
        description: roleData.description,
      },
      include: { permissions: { include: { permission: true } } },
    });
    return RoleMapper.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }

  // 👇 KRİTİK: Yetki Güncelleme Mantığı
  async assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    // Transaction: Önce eskileri sil, sonra yenileri ekle
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: permissionIds.map(pid => ({ roleId, permissionId: pid })),
      }),
    ]);
  }

  async getPermissions(roleId: number): Promise<Permission[]> {
    // Sadece yetkileri getirir (Helper amaçlı)
    return []; // İhtiyaç olursa implemente edilir, şimdilik mapper hallediyor
  }
}