import { Injectable, Logger } from '@nestjs/common';
import { ITaskHandler, TaskContext, TaskResult } from '../../core/interfaces/i-task-handler';
import { TaskHandler } from '../../infrastructure/common/decorators/task-handler.decorator';
import { IFileRepository } from '../../core/repositories/i-file.repository';
import { Inject } from '@nestjs/common';
import { FileStatus } from '../../core/entities/file-status.enum';
import { FileStorageService } from '../../infrastructure/common/services/file-storage.service';

@TaskHandler('cleanup-deleted-files', {
  description: 'Silinmiş dosyaları kalıcı olarak temizler (30 günden eski)',
  category: 'maintenance',
})
@Injectable()
export class CleanupDeletedFilesHandler implements ITaskHandler {
  name = 'cleanup-deleted-files';
  description = 'Silinmiş dosyaları kalıcı olarak temizler (30 günden eski)';
  private readonly logger = new Logger(CleanupDeletedFilesHandler.name);

  constructor(
    @Inject(IFileRepository) private fileRepository: IFileRepository,
    private fileStorage: FileStorageService,
  ) {}

  async execute(payload: any, context: TaskContext): Promise<TaskResult> {
    this.logger.log('Silinmiş dosyaların temizlenmesi başlatılıyor...');

    // Silinmiş dosyaları bul (30 günden eski)
    const deletedFiles = await this.fileRepository.findByStatus(FileStatus.DELETED);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filesToDelete = deletedFiles.filter(
      file => file.deletedAt && file.deletedAt < thirtyDaysAgo,
    );

    this.logger.log(`${filesToDelete.length} dosya kalıcı olarak silinecek`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const file of filesToDelete) {
      try {
        // Fiziksel dosyayı sil
        await this.fileStorage.deleteFile(file.path, file.storageType);

        // DB kaydını sil
        await this.fileRepository.delete(file.id);

        deletedCount++;
        this.logger.debug(`Dosya silindi: ${file.id} - ${file.originalName}`);
      } catch (error) {
        errorCount++;
        this.logger.error(
          `Dosya silinirken hata: ${file.id} - ${error.message}`,
          error.stack,
        );
      }
    }

    this.logger.log(
      `Temizleme tamamlandı: ${deletedCount} dosya silindi, ${errorCount} hata`,
    );

    return {
      success: errorCount === 0,
      data: {
        totalFiles: filesToDelete.length,
        deletedCount,
        errorCount,
        timestamp: new Date(),
      },
      message: `${deletedCount} dosya kalıcı olarak silindi${errorCount > 0 ? `, ${errorCount} hata oluştu` : ''}`,
    };
  }
}

