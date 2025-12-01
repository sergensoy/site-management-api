import { BaseEntity } from './base.entity';
import { NotificationChannel } from './notification-channel.enum';

export class NotificationPreference extends BaseEntity {
  userId!: number;
  category!: string; // "PAYMENT", "DEBT", "ANNOUNCEMENT", "SYSTEM", "ALL"
  channel!: NotificationChannel;
  enabled!: boolean;

  constructor(data: Partial<NotificationPreference>) {
    super(data);
    Object.assign(this, data);
  }
}

