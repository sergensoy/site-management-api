import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { INotificationRepository } from '../../core/repositories/i-notification.repository';
import { PrismaNotificationRepository } from '../../infrastructure/repositories/prisma-notification.repository';
import { NotificationService as InfrastructureNotificationService } from '../../infrastructure/common/services/notification.service';
import { EmailService } from '../../infrastructure/common/services/email.service';
import { SmsService } from '../../infrastructure/common/services/sms.service';
import { TemplateEngineService } from '../../infrastructure/common/services/template-engine.service';
import { INotificationTemplateRepository } from '../../core/repositories/i-notification-template.repository';
import { PrismaNotificationTemplateRepository } from '../../infrastructure/repositories/prisma-notification-template.repository';
import { INotificationPreferenceRepository } from '../../core/repositories/i-notification-preference.repository';
import { PrismaNotificationPreferenceRepository } from '../../infrastructure/repositories/prisma-notification-preference.repository';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    InfrastructureNotificationService,
    EmailService,
    SmsService,
    TemplateEngineService,
    PrismaService,
    {
      provide: INotificationRepository,
      useClass: PrismaNotificationRepository,
    },
    {
      provide: INotificationTemplateRepository,
      useClass: PrismaNotificationTemplateRepository,
    },
    {
      provide: INotificationPreferenceRepository,
      useClass: PrismaNotificationPreferenceRepository,
    },
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [NotificationService, InfrastructureNotificationService],
})
export class NotificationModule {}

