import { IGenericRepository } from './i-generic.repository';
import { AnnouncementRead } from '../entities/announcement-read.entity';

export interface IAnnouncementReadRepository extends IGenericRepository<AnnouncementRead> {
  findByAnnouncement(announcementId: number): Promise<AnnouncementRead[]>;
  findByUser(userId: number): Promise<AnnouncementRead[]>;
  findByAnnouncementAndUser(announcementId: number, userId: number): Promise<AnnouncementRead | null>;
  markAsRead(announcementId: number, userId: number): Promise<AnnouncementRead>;
  markAllAsRead(userId: number, announcementIds: number[]): Promise<number>;
  getReadCount(announcementId: number): Promise<number>;
  getUnreadCount(userId: number, announcementIds: number[]): Promise<number>;
}

export const IAnnouncementReadRepository = Symbol('IAnnouncementReadRepository');

