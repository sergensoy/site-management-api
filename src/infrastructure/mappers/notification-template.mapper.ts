import { NotificationTemplate as PrismaNotificationTemplate } from '@prisma/client';
import { NotificationTemplate } from '../../core/entities/notification-template.entity';
import { NotificationChannel } from '../../core/entities/notification-channel.enum';

export class NotificationTemplateMapper {
  static toDomain(raw: PrismaNotificationTemplate): NotificationTemplate {
    return new NotificationTemplate({
      id: raw.id,
      code: raw.code,
      name: raw.name,
      description: raw.description || undefined,
      category: raw.category,
      channel: raw.channel as NotificationChannel,
      subject: raw.subject || undefined,
      bodyHtml: raw.bodyHtml || undefined,
      bodyText: raw.bodyText || undefined,
      variables: raw.variables as Record<string, any> | undefined,
      isActive: raw.isActive,
      isSystem: raw.isSystem,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(template: NotificationTemplate): Partial<PrismaNotificationTemplate> {
    return {
      code: template.code,
      name: template.name,
      description: template.description,
      category: template.category,
      channel: template.channel,
      subject: template.subject,
      bodyHtml: template.bodyHtml,
      bodyText: template.bodyText,
      variables: template.variables,
      isActive: template.isActive,
      isSystem: template.isSystem,
    };
  }
}

