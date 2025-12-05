import { Injectable } from '@nestjs/common';
import { IAnnouncementRepository } from '../../core/repositories/i-announcement.repository';
import { Announcement } from '../../core/entities/announcement.entity';
import { PrismaService } from '../prisma/prisma.service';
import { AnnouncementMapper } from '../mappers/announcement.mapper';
import { AnnouncementCategory } from '../../core/entities/announcement-category.enum';
import { AnnouncementStatus } from '../../core/entities/announcement-status.enum';
import { AnnouncementPriority } from '../../core/entities/announcement-priority.enum';
import { TargetAudienceType } from '../../core/entities/target-audience-type.enum';

@Injectable()
export class PrismaAnnouncementRepository implements IAnnouncementRepository {
  constructor(private prisma: PrismaService) {}

  async create(announcement: Announcement): Promise<Announcement> {
    const data = AnnouncementMapper.toPersistence(announcement);
    const created = await this.prisma.announcement.create({ data });
    return AnnouncementMapper.toDomain(created);
  }

  async update(id: number, announcement: Partial<Announcement>): Promise<Announcement> {
    const updated = await this.prisma.announcement.update({
      where: { id },
      data: {
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        priority: announcement.priority,
        status: announcement.status,
        siteId: announcement.siteId,
        publishedAt: announcement.publishedAt,
        expiresAt: announcement.expiresAt,
        isPinned: announcement.isPinned,
        targetAudience: announcement.targetAudience,
        targetIds: announcement.targetIds ? announcement.targetIds : undefined,
        updatedById: announcement.updatedById,
        deletedAt: announcement.deletedAt,
      },
    });
    return AnnouncementMapper.toDomain(updated);
  }

  async findById(id: number): Promise<Announcement | null> {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement || announcement.deletedAt) return null;
    return AnnouncementMapper.toDomain(announcement);
  }

  async findAll(): Promise<Announcement[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: { deletedAt: null },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
    });
    return announcements.map(AnnouncementMapper.toDomain);
  }

  async delete(id: number, deletedById?: number): Promise<void> {
    await this.prisma.announcement.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  }

  async findByCategory(category: AnnouncementCategory): Promise<Announcement[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: { category, deletedAt: null },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
    });
    return announcements.map(AnnouncementMapper.toDomain);
  }

  async findByStatus(status: AnnouncementStatus): Promise<Announcement[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: { status, deletedAt: null },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
    });
    return announcements.map(AnnouncementMapper.toDomain);
  }

  async findByPriority(priority: AnnouncementPriority): Promise<Announcement[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: { priority, deletedAt: null },
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' },
      ],
    });
    return announcements.map(AnnouncementMapper.toDomain);
  }

  async findBySite(siteId: number): Promise<Announcement[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: { siteId, deletedAt: null },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
    });
    return announcements.map(AnnouncementMapper.toDomain);
  }

  async findPublished(): Promise<Announcement[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: {
        status: AnnouncementStatus.PUBLISHED,
        deletedAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
    });
    return announcements.map(AnnouncementMapper.toDomain);
  }

  async findExpired(): Promise<Announcement[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: {
        expiresAt: { lte: new Date() },
        status: { not: AnnouncementStatus.EXPIRED },
        deletedAt: null,
      },
    });
    return announcements.map(AnnouncementMapper.toDomain);
  }

  async findPinned(): Promise<Announcement[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: {
        isPinned: true,
        deletedAt: null,
      },
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
    });
    return announcements.map(AnnouncementMapper.toDomain);
  }

  async searchByTitle(searchTerm: string): Promise<Announcement[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: {
        title: { contains: searchTerm },
        deletedAt: null,
      },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
    });
    return announcements.map(AnnouncementMapper.toDomain);
  }

  async findByTargetAudience(
    targetAudience: TargetAudienceType,
    targetIds?: number[],
  ): Promise<Announcement[]> {
    const where: any = {
      targetAudience,
      deletedAt: null,
    };

    if (targetIds && targetIds.length > 0) {
      // JSON array içinde targetIds kontrolü
      // Prisma JSON filtering sınırlı, client-side filtering yapacağız
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
    });

    let filtered = announcements.map(AnnouncementMapper.toDomain);

    // Client-side filtering for targetIds
    if (targetIds && targetIds.length > 0) {
      filtered = filtered.filter(ann => {
        if (!ann.targetIds) return false;
        return targetIds.some(id => ann.targetIds?.includes(id));
      });
    }

    return filtered;
  }

  async findForUser(
    userId: number,
    siteId?: number,
    unitIds?: number[],
  ): Promise<Announcement[]> {
    const published = await this.findPublished();
    
    return published.filter(announcement => {
      return announcement.canBeViewedBy(userId, siteId, unitIds);
    });
  }
}

