import { BaseEntity } from './base.entity';
import { NotificationChannel } from './notification-channel.enum';

export class NotificationTemplate extends BaseEntity {
  code!: string;
  name!: string;
  description?: string;
  category!: string; // "PAYMENT", "DEBT", "ANNOUNCEMENT", "SYSTEM"
  channel!: NotificationChannel;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  variables?: Record<string, any>;
  isActive!: boolean;
  isSystem!: boolean;

  constructor(data: Partial<NotificationTemplate>) {
    super(data);
    Object.assign(this, data);
  }
}

