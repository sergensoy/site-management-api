import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { INotificationTemplateRepository } from '../../core/repositories/i-notification-template.repository';
import { NotificationTemplate } from '../../core/entities/notification-template.entity';
import { NotificationTemplateMapper } from '../mappers/notification-template.mapper';
import { NotificationChannel } from '../../core/entities/notification-channel.enum';

@Injectable()
export class PrismaNotificationTemplateRepository implements INotificationTemplateRepository {
  constructor(private prisma: PrismaService) {}

  async create(template: NotificationTemplate): Promise<NotificationTemplate> {
    const data = NotificationTemplateMapper.toPersistence(template);
    const created = await this.prisma.notificationTemplate.create({
      data: data as any,
    });
    return NotificationTemplateMapper.toDomain(created);
  }

  async findById(id: number): Promise<NotificationTemplate | null> {
    const found = await this.prisma.notificationTemplate.findFirst({
      where: { id, deletedAt: null },
    });
    return found ? NotificationTemplateMapper.toDomain(found) : null;
  }

  async findByCode(code: string): Promise<NotificationTemplate | null> {
    const found = await this.prisma.notificationTemplate.findFirst({
      where: { code, deletedAt: null },
    });
    return found ? NotificationTemplateMapper.toDomain(found) : null;
  }

  async findAll(): Promise<NotificationTemplate[]> {
    const all = await this.prisma.notificationTemplate.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return all.map(NotificationTemplateMapper.toDomain);
  }

  async findByCategory(category: string): Promise<NotificationTemplate[]> {
    const templates = await this.prisma.notificationTemplate.findMany({
      where: { category, deletedAt: null, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return templates.map(NotificationTemplateMapper.toDomain);
  }

  async findByChannel(channel: NotificationChannel): Promise<NotificationTemplate[]> {
    const templates = await this.prisma.notificationTemplate.findMany({
      where: { channel, deletedAt: null, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return templates.map(NotificationTemplateMapper.toDomain);
  }

  async update(id: number, data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const updateData = NotificationTemplateMapper.toPersistence(data as NotificationTemplate);
    const updated = await this.prisma.notificationTemplate.update({
      where: { id },
      data: updateData as any,
    });
    return NotificationTemplateMapper.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.notificationTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

