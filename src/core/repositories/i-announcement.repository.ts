import { IGenericRepository } from './i-generic.repository';
import { Announcement } from '../entities/announcement.entity';
import { AnnouncementCategory } from '../entities/announcement-category.enum';
import { AnnouncementStatus } from '../entities/announcement-status.enum';
import { AnnouncementPriority } from '../entities/announcement-priority.enum';
import { TargetAudienceType } from '../entities/target-audience-type.enum';

export interface IAnnouncementRepository extends IGenericRepository<Announcement> {
  findByCategory(category: AnnouncementCategory): Promise<Announcement[]>;
  findByStatus(status: AnnouncementStatus): Promise<Announcement[]>;
  findByPriority(priority: AnnouncementPriority): Promise<Announcement[]>;
  findBySite(siteId: number): Promise<Announcement[]>;
  findPublished(): Promise<Announcement[]>;
  findExpired(): Promise<Announcement[]>;
  findPinned(): Promise<Announcement[]>;
  searchByTitle(searchTerm: string): Promise<Announcement[]>;
  findByTargetAudience(
    targetAudience: TargetAudienceType,
    targetIds?: number[],
  ): Promise<Announcement[]>;
  findForUser(
    userId: number,
    siteId?: number,
    unitIds?: number[],
  ): Promise<Announcement[]>;
}

export const IAnnouncementRepository = Symbol('IAnnouncementRepository');

