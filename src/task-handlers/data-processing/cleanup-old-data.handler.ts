import { Injectable } from '@nestjs/common';
import { ITaskHandler, TaskContext, TaskResult } from '../../core/interfaces/i-task-handler';
import { TaskHandler } from '../../infrastructure/common/decorators/task-handler.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@TaskHandler('cleanup-old-data', {
  description: 'Eski verileri temizler',
  category: 'data-processing',
})
@Injectable()
export class CleanupOldDataHandler implements ITaskHandler {
  name = 'cleanup-old-data';
  description = 'Eski verileri temizler';

  constructor(private prisma: PrismaService) {}

  async execute(
    payload: { daysOld: number; tables?: string[] },
    context: TaskContext,
  ): Promise<TaskResult> {
    const deleted = await this.cleanup(payload.daysOld, payload.tables);
    return {
      success: true,
      data: { deletedCount: deleted },
      message: `${deleted} kayıt silindi`,
    };
  }

  validate(payload: any): boolean {
    return payload?.daysOld && typeof payload.daysOld === 'number' && payload.daysOld > 0;
  }

  private async cleanup(daysOld: number, tables?: string[]): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let totalDeleted = 0;

    // AuditLog temizleme
    if (!tables || tables.includes('auditLogs')) {
      const deletedAuditLogs = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });
      totalDeleted += deletedAuditLogs.count;
    }

    // LoginAudit temizleme
    if (!tables || tables.includes('loginAudits')) {
      const deletedLoginAudits = await this.prisma.loginAudit.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });
      totalDeleted += deletedLoginAudits.count;
    }

    return totalDeleted;
  }
}

