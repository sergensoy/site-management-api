import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { INotificationPreferenceRepository } from '../../core/repositories/i-notification-preference.repository';
import { NotificationPreference } from '../../core/entities/notification-preference.entity';
import { NotificationPreferenceMapper } from '../mappers/notification-preference.mapper';
import { NotificationChannel } from '../../core/entities/notification-channel.enum';

@Injectable()
export class PrismaNotificationPreferenceRepository implements INotificationPreferenceRepository {
  constructor(private prisma: PrismaService) {}

  async create(preference: NotificationPreference): Promise<NotificationPreference> {
    const data = NotificationPreferenceMapper.toPersistence(preference);
    const created = await this.prisma.notificationPreference.create({
      data: data as any,
    });
    return NotificationPreferenceMapper.toDomain(created);
  }

  async findByUser(userId: number): Promise<NotificationPreference[]> {
    const preferences = await this.prisma.notificationPreference.findMany({
      where: { userId },
    });
    return preferences.map(NotificationPreferenceMapper.toDomain);
  }

  async findByUserAndCategory(userId: number, category: string): Promise<NotificationPreference[]> {
    const preferences = await this.prisma.notificationPreference.findMany({
      where: { userId, category },
    });
    return preferences.map(NotificationPreferenceMapper.toDomain);
  }

  async findByUserCategoryAndChannel(
    userId: number,
    category: string,
    channel: NotificationChannel,
  ): Promise<NotificationPreference | null> {
    const found = await this.prisma.notificationPreference.findUnique({
      where: {
        userId_category_channel: {
          userId,
          category,
          channel,
        },
      },
    });
    return found ? NotificationPreferenceMapper.toDomain(found) : null;
  }

  async update(id: number, data: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const updateData = NotificationPreferenceMapper.toPersistence(data as NotificationPreference);
    const updated = await this.prisma.notificationPreference.update({
      where: { id },
      data: updateData as any,
    });
    return NotificationPreferenceMapper.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.notificationPreference.delete({
      where: { id },
    });
  }

  async upsert(preference: NotificationPreference): Promise<NotificationPreference> {
    const data = NotificationPreferenceMapper.toPersistence(preference);
    const upserted = await this.prisma.notificationPreference.upsert({
      where: {
        userId_category_channel: {
          userId: preference.userId,
          category: preference.category,
          channel: preference.channel,
        },
      },
      update: data as any,
      create: data as any,
    });
    return NotificationPreferenceMapper.toDomain(upserted);
  }
}

