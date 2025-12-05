import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IAnnouncementRepository } from '../../core/repositories/i-announcement.repository';
import { IAnnouncementReadRepository } from '../../core/repositories/i-announcement-read.repository';
import { Announcement } from '../../core/entities/announcement.entity';
import { AnnouncementRead } from '../../core/entities/announcement-read.entity';
import { AnnouncementStatus } from '../../core/entities/announcement-status.enum';
import { AnnouncementPriority } from '../../core/entities/announcement-priority.enum';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { FilterAnnouncementDto } from './dto/filter-announcement.dto';
import { AnnouncementPublishedEvent } from '../../core/events/announcement-published.event';
import { AnnouncementExpiredEvent } from '../../core/events/announcement-expired.event';

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);

  constructor(
    @Inject(IAnnouncementRepository) private announcementRepository: IAnnouncementRepository,
    @Inject(IAnnouncementReadRepository) private announcementReadRepository: IAnnouncementReadRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateAnnouncementDto, userId: number): Promise<Announcement> {
    const newAnnouncement = new Announcement({
      title: dto.title,
      content: dto.content,
      category: dto.category,
      priority: dto.priority || AnnouncementPriority.NORMAL,
      status: AnnouncementStatus.DRAFT,
      siteId: dto.siteId,
      publishedAt: dto.publishedAt,
      expiresAt: dto.expiresAt,
      isPinned: dto.isPinned ?? false,
      targetAudience: dto.targetAudience,
      targetIds: dto.targetIds,
      createdById: userId,
    });

    const created = await this.announcementRepository.create(newAnnouncement);

    // Eğer publishedAt verilmişse ve geçmişte değilse otomatik publish et
    if (dto.publishedAt && dto.publishedAt <= new Date()) {
      await this.publish(created.id, userId);
    }

    return created;
  }

  async findAll(filterDto: FilterAnnouncementDto): Promise<any> {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    let announcements: Announcement[];

    if (filterDto.category) {
      announcements = await this.announcementRepository.findByCategory(filterDto.category);
    } else if (filterDto.status) {
      announcements = await this.announcementRepository.findByStatus(filterDto.status);
    } else if (filterDto.priority) {
      announcements = await this.announcementRepository.findByPriority(filterDto.priority);
    } else if (filterDto.siteId) {
      announcements = await this.announcementRepository.findBySite(filterDto.siteId);
    } else if (filterDto.search) {
      announcements = await this.announcementRepository.searchByTitle(filterDto.search);
    } else {
      announcements = await this.announcementRepository.findAll();
    }

    // Ek filtreleme
    if (filterDto.status && !filterDto.category) {
      announcements = announcements.filter(a => a.status === filterDto.status);
    }
    if (filterDto.isPinned !== undefined) {
      announcements = announcements.filter(a => a.isPinned === filterDto.isPinned);
    }
    if (filterDto.dateFrom) {
      announcements = announcements.filter(a => 
        a.publishedAt && a.publishedAt >= filterDto.dateFrom!
      );
    }
    if (filterDto.dateTo) {
      announcements = announcements.filter(a => 
        a.publishedAt && a.publishedAt <= filterDto.dateTo!
      );
    }

    const total = announcements.length;
    const paginated = announcements.slice(skip, skip + limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Announcement> {
    const announcement = await this.announcementRepository.findById(id);
    if (!announcement) {
      throw new NotFoundException('Duyuru bulunamadı.');
    }
    return announcement;
  }

  async update(id: number, dto: UpdateAnnouncementDto, userId: number): Promise<Announcement> {
    await this.findOne(id);
    return this.announcementRepository.update(id, {
      ...dto,
      updatedById: userId,
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id);
    return this.announcementRepository.delete(id, userId);
  }

  async publish(id: number, userId: number): Promise<Announcement> {
    const announcement = await this.findOne(id);

    if (announcement.status === AnnouncementStatus.PUBLISHED) {
      throw new BadRequestException('Duyuru zaten yayında.');
    }

    const updated = await this.announcementRepository.update(id, {
      status: AnnouncementStatus.PUBLISHED,
      publishedAt: new Date(),
      updatedById: userId,
    });

    // Event emit et
    this.eventEmitter.emit(
      'announcement.published',
      new AnnouncementPublishedEvent(updated, userId),
    );

    this.logger.log(`Announcement published: ${id} by user ${userId}`);
    return updated;
  }

  async archive(id: number, userId: number): Promise<Announcement> {
    const announcement = await this.findOne(id);
    
    if (announcement.status === AnnouncementStatus.ARCHIVED) {
      throw new BadRequestException('Duyuru zaten arşivlenmiş.');
    }

    return this.announcementRepository.update(id, {
      status: AnnouncementStatus.ARCHIVED,
      updatedById: userId,
    });
  }

  async togglePin(id: number, userId: number): Promise<Announcement> {
    const announcement = await this.findOne(id);
    
    return this.announcementRepository.update(id, {
      isPinned: !announcement.isPinned,
      updatedById: userId,
    });
  }

  async markAsRead(announcementId: number, userId: number): Promise<AnnouncementRead> {
    await this.findOne(announcementId);
    return this.announcementReadRepository.markAsRead(announcementId, userId);
  }

  async markAllAsRead(userId: number, announcementIds: number[]): Promise<number> {
    return this.announcementReadRepository.markAllAsRead(userId, announcementIds);
  }

  async findForUser(
    userId: number,
    siteId?: number,
    unitIds?: number[],
  ): Promise<Announcement[]> {
    return this.announcementRepository.findForUser(userId, siteId, unitIds);
  }

  async findUnread(userId: number, siteId?: number, unitIds?: number[]): Promise<Announcement[]> {
    const allAnnouncements = await this.findForUser(userId, siteId, unitIds);
    const readRecords = await this.announcementReadRepository.findByUser(userId);
    const readIds = new Set(readRecords.map(r => r.announcementId));

    return allAnnouncements.filter(a => !readIds.has(a.id));
  }

  async getReaders(announcementId: number): Promise<AnnouncementRead[]> {
    await this.findOne(announcementId);
    return this.announcementReadRepository.findByAnnouncement(announcementId);
  }

  async getStatistics(announcementId: number): Promise<any> {
    const announcement = await this.findOne(announcementId);
    const readCount = await this.announcementReadRepository.getReadCount(announcementId);
    const readers = await this.announcementReadRepository.findByAnnouncement(announcementId);

    // Hedef kitle sayısını hesapla (basitleştirilmiş)
    let targetCount = 0;
    // Bu logic daha detaylı implement edilebilir (site, block, unit bazlı)

    return {
      announcementId: announcement.id,
      title: announcement.title,
      status: announcement.status,
      readCount,
      totalReaders: readers.length,
      targetCount,
      readRate: targetCount > 0 ? (readCount / targetCount) * 100 : 0,
    };
  }

  async archiveExpired(): Promise<number> {
    const expired = await this.announcementRepository.findExpired();
    let count = 0;

    for (const announcement of expired) {
      await this.announcementRepository.update(announcement.id, {
        status: AnnouncementStatus.EXPIRED,
      });

      // Event emit et
      this.eventEmitter.emit(
        'announcement.expired',
        new AnnouncementExpiredEvent(announcement),
      );

      count++;
    }

    this.logger.log(`Archived ${count} expired announcements`);
    return count;
  }
}

