import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { INotificationRepository } from '../../core/repositories/i-notification.repository';
import { Notification } from '../../core/entities/notification.entity';
import { NotificationMapper } from '../mappers/notification.mapper';
import { NotificationStatus } from '../../core/entities/notification-status.enum';
import { NotificationChannel } from '../../core/entities/notification-channel.enum';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private prisma: PrismaService) {}

  async create(notification: Notification): Promise<Notification> {
    const data = NotificationMapper.toPersistence(notification);
    const created = await this.prisma.notification.create({
      data: data as any,
    });
    return NotificationMapper.toDomain(created);
  }

  async findById(id: number): Promise<Notification | null> {
    const found = await this.prisma.notification.findUnique({
      where: { id },
    });
    return found ? NotificationMapper.toDomain(found) : null;
  }

  async findByUser(userId: number, limit: number = 50): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return notifications.map(NotificationMapper.toDomain);
  }

  async findByStatus(status: NotificationStatus): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map(NotificationMapper.toDomain);
  }

  async findByChannel(channel: NotificationChannel): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { channel },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map(NotificationMapper.toDomain);
  }

  async update(id: number, data: Partial<Notification>): Promise<Notification> {
    const updateData = NotificationMapper.toPersistence(data as Notification);
    const updated = await this.prisma.notification.update({
      where: { id },
      data: updateData as any,
    });
    return NotificationMapper.toDomain(updated);
  }

  async findPending(limit: number = 100): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        status: NotificationStatus.PENDING,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return notifications.map(NotificationMapper.toDomain);
  }
}

