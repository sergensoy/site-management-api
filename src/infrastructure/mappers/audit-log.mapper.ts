import { AuditLog as PrismaAuditLog } from '@prisma/client';
import { AuditLog } from '../../core/entities/audit-log.entity';

export class AuditLogMapper {
  static toDomain(raw: PrismaAuditLog): AuditLog {
    return new AuditLog({
      id: raw.id,
      userId: raw.userId,
      action: raw.action,
      resource: raw.resource,
      oldValue: raw.oldValue ? (typeof raw.oldValue === 'string' ? JSON.parse(raw.oldValue) : raw.oldValue) : null,
      newValue: raw.newValue ? (typeof raw.newValue === 'string' ? JSON.parse(raw.newValue) : raw.newValue) : null,
      createdAt: raw.createdAt,
    });
  }
}

