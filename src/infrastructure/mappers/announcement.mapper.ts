import { Announcement as PrismaAnnouncement, Prisma } from '@prisma/client';
import { Announcement } from '../../core/entities/announcement.entity';
import { AnnouncementCategory } from '../../core/entities/announcement-category.enum';
import { AnnouncementPriority } from '../../core/entities/announcement-priority.enum';
import { AnnouncementStatus } from '../../core/entities/announcement-status.enum';
import { TargetAudienceType } from '../../core/entities/target-audience-type.enum';

export class AnnouncementMapper {
  static toDomain(raw: PrismaAnnouncement): Announcement {
    // targetIds JSON'dan number[]'e çevir
    let targetIds: number[] | null = null;
    if (raw.targetIds) {
      try {
        targetIds = Array.isArray(raw.targetIds) 
          ? (raw.targetIds as any[]).map(id => Number(id))
          : null;
      } catch {
        targetIds = null;
      }
    }

    return new Announcement({
      id: raw.id,
      title: raw.title,
      content: raw.content,
      category: raw.category as AnnouncementCategory,
      priority: raw.priority as AnnouncementPriority,
      status: raw.status as AnnouncementStatus,
      siteId: raw.siteId,
      publishedAt: raw.publishedAt,
      expiresAt: raw.expiresAt,
      isPinned: raw.isPinned,
      targetAudience: raw.targetAudience as TargetAudienceType,
      targetIds,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toPersistence(announcement: Partial<Announcement>): Prisma.AnnouncementUncheckedCreateInput {
    return {
      title: announcement.title!,
      content: announcement.content!,
      category: announcement.category!,
      priority: announcement.priority!,
      status: announcement.status!,
      siteId: announcement.siteId,
      publishedAt: announcement.publishedAt,
      expiresAt: announcement.expiresAt,
      isPinned: announcement.isPinned ?? false,
      targetAudience: announcement.targetAudience!,
      targetIds: announcement.targetIds ? announcement.targetIds : undefined,
      createdById: announcement.createdById,
      updatedById: announcement.updatedById,
      deletedById: announcement.deletedById,
      deletedAt: announcement.deletedAt,
    };
  }
}

