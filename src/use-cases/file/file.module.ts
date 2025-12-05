import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { IFileRepository } from '../../core/repositories/i-file.repository';
import { PrismaFileRepository } from '../../infrastructure/repositories/prisma-file.repository';
import { IFileAttachmentRepository } from '../../core/repositories/i-file-attachment.repository';
import { PrismaFileAttachmentRepository } from '../../infrastructure/repositories/prisma-file-attachment.repository';
import { FileValidatorService } from '../../infrastructure/common/services/file-validator.service';
import { FileStorageService } from '../../infrastructure/common/services/file-storage.service';
import { LocalStorageService } from '../../infrastructure/common/services/local-storage.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [FileController],
  providers: [
    FileService,
    FileValidatorService,
    LocalStorageService,
    FileStorageService,
    { provide: IFileRepository, useClass: PrismaFileRepository },
    { provide: IFileAttachmentRepository, useClass: PrismaFileAttachmentRepository },
  ],
  exports: [
    FileService,
    IFileRepository,
    IFileAttachmentRepository,
    FileStorageService,
    FileValidatorService,
    LocalStorageService,
  ],
})
export class FileModule {}

