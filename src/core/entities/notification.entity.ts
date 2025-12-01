import { BaseEntity } from './base.entity';
import { NotificationChannel } from './notification-channel.enum';
import { NotificationStatus } from './notification-status.enum';

export class Notification extends BaseEntity {
  userId!: number;
  templateId?: number;
  channel!: NotificationChannel;
  status!: NotificationStatus;
  recipient!: string; // Email veya telefon numarası
  subject?: string;
  body!: string;
  bodyHtml?: string;
  variables?: Record<string, any>;
  sentAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  retryCount!: number;
  maxRetries!: number;
  metadata?: Record<string, any>;

  constructor(data: Partial<Notification>) {
    super(data);
    Object.assign(this, data);
  }
}

