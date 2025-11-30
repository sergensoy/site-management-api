import { Role as PrismaRole, Permission as PrismaPermission, RolePermission } from '@prisma/client';
import { Role } from '../../core/entities/role.entity';
import { Permission } from '../../core/entities/permission.entity';

// Prisma'dan gelen veri tipi (İlişkileri içeren)
type PrismaRoleWithRelations = PrismaRole & {
  permissions: (RolePermission & { permission: PrismaPermission })[];
};

export class RoleMapper {
  static toDomain(raw: PrismaRoleWithRelations): Role {
    const permissions = raw.permissions.map(rp => new Permission({
      id: rp.permission.id,
      slug: rp.permission.slug,
      description: rp.permission.description,
      module: rp.permission.module,
    }));

    return new Role({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      isSystem: raw.isSystem,
      permissions: permissions,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}