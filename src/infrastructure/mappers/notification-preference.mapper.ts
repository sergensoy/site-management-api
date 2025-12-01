import { NotificationPreference as PrismaNotificationPreference } from '@prisma/client';
import { NotificationPreference } from '../../core/entities/notification-preference.entity';
import { NotificationChannel } from '../../core/entities/notification-channel.enum';

export class NotificationPreferenceMapper {
  static toDomain(raw: PrismaNotificationPreference): NotificationPreference {
    return new NotificationPreference({
      id: raw.id,
      userId: raw.userId,
      category: raw.category,
      channel: raw.channel as NotificationChannel,
      enabled: raw.enabled,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(preference: NotificationPreference): Partial<PrismaNotificationPreference> {
    return {
      userId: preference.userId,
      category: preference.category,
      channel: preference.channel,
      enabled: preference.enabled,
    };
  }
}

