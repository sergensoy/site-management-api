import { NotificationTemplate } from '../entities/notification-template.entity';
import { NotificationChannel } from '../entities/notification-channel.enum';

// NestJS Dependency Injection için Token
export const INotificationTemplateRepository = Symbol('INotificationTemplateRepository');

export interface INotificationTemplateRepository {
  create(template: NotificationTemplate): Promise<NotificationTemplate>;
  findById(id: number): Promise<NotificationTemplate | null>;
  findByCode(code: string): Promise<NotificationTemplate | null>;
  findAll(): Promise<NotificationTemplate[]>;
  findByCategory(category: string): Promise<NotificationTemplate[]>;
  findByChannel(channel: NotificationChannel): Promise<NotificationTemplate[]>;
  update(id: number, data: Partial<NotificationTemplate>): Promise<NotificationTemplate>;
  delete(id: number): Promise<void>;
}

