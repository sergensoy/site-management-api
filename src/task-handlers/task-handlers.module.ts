import { Module } from '@nestjs/common';
import { MonthlyDuesReportHandler } from './reports/monthly-dues-report.handler';
import { CleanupOldDataHandler } from './data-processing/cleanup-old-data.handler';
import { AccrueMonthlyDuesHandler } from './finance/accrue-monthly-dues.handler';
import { CheckOverdueDebtsHandler } from './finance/check-overdue-debts.handler';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@Module({
  imports: [],
  providers: [
    PrismaService,
    MonthlyDuesReportHandler,
    CleanupOldDataHandler,
    AccrueMonthlyDuesHandler,
    CheckOverdueDebtsHandler,
  ],
  exports: [
    MonthlyDuesReportHandler,
    CleanupOldDataHandler,
    AccrueMonthlyDuesHandler,
    CheckOverdueDebtsHandler,
  ],
})
export class TaskHandlersModule {}

