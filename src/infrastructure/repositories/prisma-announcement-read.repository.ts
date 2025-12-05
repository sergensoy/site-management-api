import { Injectable } from '@nestjs/common';
import { IAnnouncementReadRepository } from '../../core/repositories/i-announcement-read.repository';
import { AnnouncementRead } from '../../core/entities/announcement-read.entity';
import { PrismaService } from '../prisma/prisma.service';
import { AnnouncementReadMapper } from '../mappers/announcement-read.mapper';

@Injectable()
export class PrismaAnnouncementReadRepository implements IAnnouncementReadRepository {
  constructor(private prisma: PrismaService) {}

  async create(read: AnnouncementRead): Promise<AnnouncementRead> {
    const data = AnnouncementReadMapper.toPersistence(read);
    const created = await this.prisma.announcementRead.create({
      data,
      include: { announcement: true },
    });
    return AnnouncementReadMapper.toDomain(created);
  }

  async update(id: number, read: Partial<AnnouncementRead>): Promise<AnnouncementRead> {
    const updated = await this.prisma.announcementRead.update({
      where: { id },
      data: {
        isRead: read.isRead,
        readAt: read.readAt,
      },
      include: { announcement: true },
    });
    return AnnouncementReadMapper.toDomain(updated);
  }

  async findById(id: number): Promise<AnnouncementRead | null> {
    const read = await this.prisma.announcementRead.findUnique({
      where: { id },
      include: { announcement: true },
    });
    return read ? AnnouncementReadMapper.toDomain(read) : null;
  }

  async findAll(): Promise<AnnouncementRead[]> {
    const reads = await this.prisma.announcementRead.findMany({
      include: { announcement: true },
    });
    return reads.map(AnnouncementReadMapper.toDomain);
  }

  async delete(id: number, deletedById?: number): Promise<void> {
    await this.prisma.announcementRead.delete({ where: { id } });
  }

  async findByAnnouncement(announcementId: number): Promise<AnnouncementRead[]> {
    const reads = await this.prisma.announcementRead.findMany({
      where: { announcementId },
      include: { announcement: true },
    });
    return reads.map(AnnouncementReadMapper.toDomain);
  }

  async findByUser(userId: number): Promise<AnnouncementRead[]> {
    const reads = await this.prisma.announcementRead.findMany({
      where: { userId },
      include: { announcement: true },
    });
    return reads.map(AnnouncementReadMapper.toDomain);
  }

  async findByAnnouncementAndUser(
    announcementId: number,
    userId: number,
  ): Promise<AnnouncementRead | null> {
    const read = await this.prisma.announcementRead.findUnique({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
      include: { announcement: true },
    });
    return read ? AnnouncementReadMapper.toDomain(read) : null;
  }

  async markAsRead(announcementId: number, userId: number): Promise<AnnouncementRead> {
    const existing = await this.findByAnnouncementAndUser(announcementId, userId);
    
    if (existing) {
      return this.update(existing.id, {
        isRead: true,
        readAt: new Date(),
      });
    }

    const newRead = new AnnouncementRead({
      announcementId,
      userId,
      readAt: new Date(),
      isRead: true,
    });

    return this.create(newRead);
  }

  async markAllAsRead(userId: number, announcementIds: number[]): Promise<number> {
    let count = 0;
    
    for (const announcementId of announcementIds) {
      const existing = await this.findByAnnouncementAndUser(announcementId, userId);
      
      if (!existing) {
        const newRead = new AnnouncementRead({
          announcementId,
          userId,
          readAt: new Date(),
          isRead: true,
        });
        await this.create(newRead);
        count++;
      } else if (!existing.isRead) {
        await this.update(existing.id, {
          isRead: true,
          readAt: new Date(),
        });
        count++;
      }
    }
    
    return count;
  }

  async getReadCount(announcementId: number): Promise<number> {
    return this.prisma.announcementRead.count({
      where: {
        announcementId,
        isRead: true,
      },
    });
  }

  async getUnreadCount(userId: number, announcementIds: number[]): Promise<number> {
    const readAnnouncementIds = await this.prisma.announcementRead.findMany({
      where: {
        userId,
        announcementId: { in: announcementIds },
        isRead: true,
      },
      select: { announcementId: true },
    });

    const readIds = new Set(readAnnouncementIds.map(r => r.announcementId));
    return announcementIds.filter(id => !readIds.has(id)).length;
  }
}

