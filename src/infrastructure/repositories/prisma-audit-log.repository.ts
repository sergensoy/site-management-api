import { Injectable } from '@nestjs/common';
import { IAuditLogRepository } from '../../core/repositories/i-audit-log.repository';
import { AuditLog } from '../../core/entities/audit-log.entity';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogMapper } from '../mappers/audit-log.mapper';

@Injectable()
export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private prisma: PrismaService) {}

  async log(
    action: string,
    resource: string,
    oldValue: any,
    newValue: any,
    userId?: number,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        resource,
        oldValue: oldValue ? oldValue : undefined,
        newValue: newValue ? newValue : undefined,
      },
    });
  }

  async findByUser(userId: number): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return logs.map(AuditLogMapper.toDomain);
  }

  async findByResource(resource: string, resourceId: number): Promise<AuditLog[]> {
    // JSON field'da contains kullanamayız, tüm resource loglarını getirip filtreleyelim
    const logs = await this.prisma.auditLog.findMany({
      where: {
        resource,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Client-side filtering - JSON içinde id kontrolü
    const filteredLogs = logs.filter(log => {
      if (!log.newValue) return false;
      try {
        const newValue = typeof log.newValue === 'string' 
          ? JSON.parse(log.newValue) 
          : log.newValue;
        return newValue && newValue.id === resourceId;
      } catch {
        return false;
      }
    });
    
    return filteredLogs.map(AuditLogMapper.toDomain);
  }
}

