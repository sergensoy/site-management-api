import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../entities/notification-status.enum';
import { NotificationChannel } from '../entities/notification-channel.enum';

// NestJS Dependency Injection için Token
export const INotificationRepository = Symbol('INotificationRepository');

export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findById(id: number): Promise<Notification | null>;
  findByUser(userId: number, limit?: number): Promise<Notification[]>;
  findByStatus(status: NotificationStatus): Promise<Notification[]>;
  findByChannel(channel: NotificationChannel): Promise<Notification[]>;
  update(id: number, data: Partial<Notification>): Promise<Notification>;
  findPending(limit?: number): Promise<Notification[]>;
}

