import { Injectable } from '@nestjs/common';
import { ITaskHandler, TaskContext, TaskResult } from '../../core/interfaces/i-task-handler';
import { TaskHandler } from '../../infrastructure/common/decorators/task-handler.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@TaskHandler('check-overdue-debts', {
  description: 'Vadesi geçen borçları kontrol eder',
  category: 'finance',
})
@Injectable()
export class CheckOverdueDebtsHandler implements ITaskHandler {
  name = 'check-overdue-debts';
  description = 'Vadesi geçen borçları kontrol eder';

  constructor(private prisma: PrismaService) {}

  async execute(
    payload: { sendNotifications?: boolean },
    context: TaskContext,
  ): Promise<TaskResult> {
    const overdueDebts = await this.findOverdueDebts();

    if (payload.sendNotifications) {
      // Notification gönderme logic'i buraya eklenebilir
      // Şimdilik sadece log
    }

    return {
      success: true,
      data: {
        count: overdueDebts.length,
        totalAmount: overdueDebts.reduce((sum, debt) => sum + Number(debt.amount), 0),
        debts: overdueDebts.map((d) => ({
          id: d.id,
          amount: Number(d.amount),
          dueDate: d.dueDate,
          payerId: d.payerId,
        })),
      },
      message: `${overdueDebts.length} vadesi geçen borç bulundu`,
    };
  }

  private async findOverdueDebts() {
    const now = new Date();
    return this.prisma.debt.findMany({
      where: {
        isPaid: false,
        dueDate: {
          lt: now,
        },
        deletedAt: null,
      },
      include: {
        payer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
      },
    });
  }
}

