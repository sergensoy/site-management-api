import { Module } from '@nestjs/common';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationTemplateController } from './notification-template.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { INotificationTemplateRepository } from '../../core/repositories/i-notification-template.repository';
import { PrismaNotificationTemplateRepository } from '../../infrastructure/repositories/prisma-notification-template.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [NotificationTemplateController],
  providers: [
    NotificationTemplateService,
    PrismaService,
    {
      provide: INotificationTemplateRepository,
      useClass: PrismaNotificationTemplateRepository,
    },
  ],
  exports: [NotificationTemplateService],
})
export class NotificationTemplateModule {}

