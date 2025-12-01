import { Module } from '@nestjs/common';
import { NotificationListener } from './notification.listener';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { TemplateEngineService } from '../services/template-engine.service';
import { PrismaService } from '../../prisma/prisma.service';
import { INotificationRepository } from '../../../core/repositories/i-notification.repository';
import { PrismaNotificationRepository } from '../../repositories/prisma-notification.repository';
import { INotificationTemplateRepository } from '../../../core/repositories/i-notification-template.repository';
import { PrismaNotificationTemplateRepository } from '../../repositories/prisma-notification-template.repository';
import { INotificationPreferenceRepository } from '../../../core/repositories/i-notification-preference.repository';
import { PrismaNotificationPreferenceRepository } from '../../repositories/prisma-notification-preference.repository';
import { IUserRepository } from '../../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../repositories/prisma-user.repository';

@Module({
  providers: [
    NotificationListener,
    NotificationService,
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
  exports: [NotificationListener],
})
export class NotificationListenerModule {}

