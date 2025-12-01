import { Injectable } from '@nestjs/common';
import { ITaskHandler, TaskContext, TaskResult } from '../../core/interfaces/i-task-handler';
import { TaskHandler } from '../../infrastructure/common/decorators/task-handler.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@TaskHandler('accrue-monthly-dues', {
  description: 'Aylık aidat tahakkuku yapar',
  category: 'finance',
})
@Injectable()
export class AccrueMonthlyDuesHandler implements ITaskHandler {
  name = 'accrue-monthly-dues';
  description = 'Aylık aidat tahakkuku yapar';

  constructor(private prisma: PrismaService) {}

  async execute(payload: { siteId: number }, context: TaskContext): Promise<TaskResult> {
    // Aidat tahakkuk logic'i
    const accrued = await this.accrueDues(payload.siteId);
    return {
      success: true,
      data: accrued,
      message: `${accrued.count} daire için aidat tahakkuku yapıldı`,
    };
  }

  validate(payload: any): boolean {
    return payload?.siteId && typeof payload.siteId === 'number';
  }

  private async accrueDues(siteId: number) {
    // Site'ı ve unit'lerini getir
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      include: {
        blocks: {
          include: {
            units: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!site) {
      throw new Error(`Site bulunamadı: ${siteId}`);
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const dueDate = new Date(currentYear, currentMonth, 1); // Ayın 1'i

    let count = 0;
    const createdDebts: number[] = [];

    // Her unit için aidat borcu oluştur
    for (const block of site.blocks) {
      for (const unit of block.units) {
        // Unit'in aktif ikamet kaydı var mı kontrol et
        const activeResidency = await this.prisma.residency.findFirst({
          where: {
            unitId: unit.id,
            status: 'ACTIVE',
            deletedAt: null,
          },
        });

        if (activeResidency) {
          // Borç oluştur
          const debt = await this.prisma.debt.create({
            data: {
              payerId: activeResidency.userId,
              unitId: unit.id,
              amount: site.defaultDues,
              description: `${currentMonth}/${currentYear} ayı aidat`,
              type: 'OPERATIONAL',
              dueDate,
              isPaid: false,
              status: 'CONFIRMED',
            },
          });
          createdDebts.push(debt.id);
          count++;
        }
      }
    }

    return {
      siteId,
      month: currentMonth,
      year: currentYear,
      count,
      debtIds: createdDebts,
    };
  }
}

