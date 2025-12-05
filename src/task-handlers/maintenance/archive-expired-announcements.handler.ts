import { Injectable, Logger, Inject } from '@nestjs/common';
import { ITaskHandler, TaskContext, TaskResult } from '../../core/interfaces/i-task-handler';
import { TaskHandler } from '../../infrastructure/common/decorators/task-handler.decorator';
import { IAnnouncementRepository } from '../../core/repositories/i-announcement.repository';
import { AnnouncementService } from '../../use-cases/announcement/announcement.service';

@TaskHandler('archive-expired-announcements', {
  description: 'Süresi dolan duyuruları otomatik olarak arşivler',
  category: 'maintenance',
})
@Injectable()
export class ArchiveExpiredAnnouncementsHandler implements ITaskHandler {
  name = 'archive-expired-announcements';
  description = 'Süresi dolan duyuruları otomatik olarak arşivler';
  private readonly logger = new Logger(ArchiveExpiredAnnouncementsHandler.name);

  constructor(
    private announcementService: AnnouncementService,
  ) {}

  async execute(payload: any, context: TaskContext): Promise<TaskResult> {
    this.logger.log('Süresi dolan duyurular arşivleniyor...');

    try {
      const archivedCount = await this.announcementService.archiveExpired();

      return {
        success: true,
        data: {
          archivedCount,
          timestamp: new Date(),
        },
        message: `${archivedCount} duyuru arşivlendi`,
      };
    } catch (error) {
      this.logger.error(`Error archiving expired announcements: ${error.message}`, error.stack);
      return {
        success: false,
        data: {
          error: error.message,
          timestamp: new Date(),
        },
        message: `Hata: ${error.message}`,
      };
    }
  }
}

