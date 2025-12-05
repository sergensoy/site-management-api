import { BaseEntity } from './base.entity';
import { Announcement } from './announcement.entity';

export class AnnouncementRead extends BaseEntity {
  announcementId!: number;
  announcement?: Announcement;
  userId!: number;
  readAt!: Date;
  isRead!: boolean;

  constructor(props?: Partial<AnnouncementRead>) {
    super(props);
    if (props) {
      Object.assign(this, props);
    }
  }
}

