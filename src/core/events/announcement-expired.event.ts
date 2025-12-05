import { Announcement } from '../entities/announcement.entity';

export class AnnouncementExpiredEvent {
  constructor(
    public readonly announcement: Announcement,
  ) {}
}

