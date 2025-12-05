import { Module } from '@nestjs/common';
import { MonthlyDuesReportHandler } from './reports/monthly-dues-report.handler';
import { CleanupOldDataHandler } from './data-processing/cleanup-old-data.handler';
import { AccrueMonthlyDuesHandler } from './finance/accrue-monthly-dues.handler';
import { CheckOverdueDebtsHandler } from './finance/check-overdue-debts.handler';
import { CleanupDeletedFilesHandler } from './maintenance/cleanup-deleted-files.handler';
import { ArchiveExpiredAnnouncementsHandler } from './maintenance/archive-expired-announcements.handler';
import { CloseExpiredPollsHandler } from './maintenance/close-expired-polls.handler';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { FileModule } from '../use-cases/file/file.module';
import { AnnouncementModule } from '../use-cases/announcement/announcement.module';
import { PollModule } from '../use-cases/poll/poll.module';

@Module({
  imports: [FileModule, AnnouncementModule, PollModule],
  providers: [
    PrismaService,
    MonthlyDuesReportHandler,
    CleanupOldDataHandler,
    AccrueMonthlyDuesHandler,
    CheckOverdueDebtsHandler,
    CleanupDeletedFilesHandler,
    ArchiveExpiredAnnouncementsHandler,
    CloseExpiredPollsHandler,
  ],
  exports: [
    MonthlyDuesReportHandler,
    CleanupOldDataHandler,
    AccrueMonthlyDuesHandler,
    CheckOverdueDebtsHandler,
    CleanupDeletedFilesHandler,
    ArchiveExpiredAnnouncementsHandler,
    CloseExpiredPollsHandler,
  ],
})
export class TaskHandlersModule {}

