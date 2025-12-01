import { NotificationPreference } from '../entities/notification-preference.entity';
import { NotificationChannel } from '../entities/notification-channel.enum';

// NestJS Dependency Injection için Token
export const INotificationPreferenceRepository = Symbol('INotificationPreferenceRepository');

export interface INotificationPreferenceRepository {
  create(preference: NotificationPreference): Promise<NotificationPreference>;
  findByUser(userId: number): Promise<NotificationPreference[]>;
  findByUserAndCategory(userId: number, category: string): Promise<NotificationPreference[]>;
  findByUserCategoryAndChannel(
    userId: number,
    category: string,
    channel: NotificationChannel,
  ): Promise<NotificationPreference | null>;
  update(id: number, data: Partial<NotificationPreference>): Promise<NotificationPreference>;
  delete(id: number): Promise<void>;
  upsert(preference: NotificationPreference): Promise<NotificationPreference>;
}

