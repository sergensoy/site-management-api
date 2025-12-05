import { Module } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { IAnnouncementRepository } from '../../core/repositories/i-announcement.repository';
import { PrismaAnnouncementRepository } from '../../infrastructure/repositories/prisma-announcement.repository';
import { IAnnouncementReadRepository } from '../../core/repositories/i-announcement-read.repository';
import { PrismaAnnouncementReadRepository } from '../../infrastructure/repositories/prisma-announcement-read.repository';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [UserModule, FileModule],
  controllers: [AnnouncementController],
  providers: [
    AnnouncementService,
    { provide: IAnnouncementRepository, useClass: PrismaAnnouncementRepository },
    { provide: IAnnouncementReadRepository, useClass: PrismaAnnouncementReadRepository },
  ],
  exports: [AnnouncementService, IAnnouncementRepository],
})
export class AnnouncementModule {}

