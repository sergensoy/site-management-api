import { Notification as PrismaNotification } from '@prisma/client';
import { Notification } from '../../core/entities/notification.entity';
import { NotificationChannel } from '../../core/entities/notification-channel.enum';
import { NotificationStatus } from '../../core/entities/notification-status.enum';

export class NotificationMapper {
  static toDomain(raw: PrismaNotification): Notification {
    return new Notification({
      id: raw.id,
      userId: raw.userId,
      templateId: raw.templateId || undefined,
      channel: raw.channel as NotificationChannel,
      status: raw.status as NotificationStatus,
      recipient: raw.recipient,
      subject: raw.subject || undefined,
      body: raw.body,
      bodyHtml: raw.bodyHtml || undefined,
      variables: raw.variables as Record<string, any> | undefined,
      sentAt: raw.sentAt || undefined,
      failedAt: raw.failedAt || undefined,
      failureReason: raw.failureReason || undefined,
      retryCount: raw.retryCount,
      maxRetries: raw.maxRetries,
      metadata: raw.metadata as Record<string, any> | undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(notification: Notification): Partial<PrismaNotification> {
    return {
      userId: notification.userId,
      templateId: notification.templateId,
      channel: notification.channel,
      status: notification.status,
      recipient: notification.recipient,
      subject: notification.subject,
      body: notification.body,
      bodyHtml: notification.bodyHtml,
      variables: notification.variables,
      sentAt: notification.sentAt,
      failedAt: notification.failedAt,
      failureReason: notification.failureReason,
      retryCount: notification.retryCount,
      maxRetries: notification.maxRetries,
      metadata: notification.metadata,
    };
  }
}

