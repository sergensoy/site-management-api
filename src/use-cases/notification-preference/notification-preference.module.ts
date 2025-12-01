import { Module } from '@nestjs/common';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationPreferenceController } from './notification-preference.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { INotificationPreferenceRepository } from '../../core/repositories/i-notification-preference.repository';
import { PrismaNotificationPreferenceRepository } from '../../infrastructure/repositories/prisma-notification-preference.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [NotificationPreferenceController],
  providers: [
    NotificationPreferenceService,
    PrismaService,
    {
      provide: INotificationPreferenceRepository,
      useClass: PrismaNotificationPreferenceRepository,
    },
  ],
  exports: [NotificationPreferenceService],
})
export class NotificationPreferenceModule {}

