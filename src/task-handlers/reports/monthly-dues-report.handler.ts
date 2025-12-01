import { Injectable } from '@nestjs/common';
import { ITaskHandler, TaskContext, TaskResult } from '../../core/interfaces/i-task-handler';
import { TaskHandler } from '../../infrastructure/common/decorators/task-handler.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@TaskHandler('monthly-dues-report', {
  description: 'Aylık aidat raporu oluşturur',
  category: 'reports',
})
@Injectable()
export class MonthlyDuesReportHandler implements ITaskHandler {
  name = 'monthly-dues-report';
  description = 'Aylık aidat raporu oluşturur';

  constructor(private prisma: PrismaService) {}

  async execute(
    payload: { siteId: number; month: number; year: number },
    context: TaskContext,
  ): Promise<TaskResult> {
    // Rapor oluşturma logic'i
    const report = await this.generateReport(payload.siteId, payload.month, payload.year);

    return {
      success: true,
      data: report,
      message: `Rapor başarıyla oluşturuldu: ${report.totalAmount} TL`,
    };
  }

  validate(payload: any): boolean {
    return payload?.siteId && payload?.month && payload?.year;
  }

  private async generateReport(siteId: number, month: number, year: number) {
    // Örnek rapor generation logic
    // Gerçek implementasyonda site'ın unit'lerini, aidatlarını hesaplar
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      include: {
        blocks: {
          include: {
            units: true,
          },
        },
      },
    });

    if (!site) {
      throw new Error(`Site bulunamadı: ${siteId}`);
    }

    const totalUnits = site.blocks.reduce(
      (sum, block) => sum + block.units.length,
      0,
    );
    const totalAmount = totalUnits * Number(site.defaultDues);

    return {
      siteId,
      siteName: site.name,
      month,
      year,
      totalUnits,
      totalAmount,
      generatedAt: new Date(),
    };
  }
}

