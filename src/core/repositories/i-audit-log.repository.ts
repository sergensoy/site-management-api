import { AuditLog } from '../entities/audit-log.entity';

export interface IAuditLogRepository {
  log(
    action: string,
    resource: string,
    oldValue: any,
    newValue: any,
    userId?: number,
  ): Promise<void>;
  findByUser(userId: number): Promise<AuditLog[]>;
  findByResource(resource: string, resourceId: number): Promise<AuditLog[]>;
}

export const IAuditLogRepository = Symbol('IAuditLogRepository');

