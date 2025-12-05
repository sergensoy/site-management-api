import { Announcement } from '../entities/announcement.entity';

export class AnnouncementPublishedEvent {
  constructor(
    public readonly announcement: Announcement,
    public readonly publishedBy: number,
  ) {}
}

