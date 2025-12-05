import { AnnouncementRead as PrismaAnnouncementRead, Prisma } from '@prisma/client';
import { AnnouncementRead } from '../../core/entities/announcement-read.entity';
import { AnnouncementMapper } from './announcement.mapper';

export class AnnouncementReadMapper {
  static toDomain(raw: PrismaAnnouncementRead & { announcement?: any }): AnnouncementRead {
    return new AnnouncementRead({
      id: raw.id,
      announcementId: raw.announcementId,
      announcement: raw.announcement ? AnnouncementMapper.toDomain(raw.announcement) : undefined,
      userId: raw.userId,
      readAt: raw.readAt,
      isRead: raw.isRead,
      createdAt: raw.readAt, // AnnouncementRead'de createdAt yok, readAt kullanıyoruz
      updatedAt: raw.readAt,
      deletedAt: null,
      createdById: null,
      updatedById: null,
      deletedById: null,
    });
  }

  static toPersistence(read: Partial<AnnouncementRead>): Prisma.AnnouncementReadUncheckedCreateInput {
    return {
      announcementId: read.announcementId!,
      userId: read.userId!,
      readAt: read.readAt || new Date(),
      isRead: read.isRead ?? true,
    };
  }
}

