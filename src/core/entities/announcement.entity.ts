import { BaseEntity } from './base.entity';
import { AnnouncementCategory } from './announcement-category.enum';
import { AnnouncementPriority } from './announcement-priority.enum';
import { AnnouncementStatus } from './announcement-status.enum';
import { TargetAudienceType } from './target-audience-type.enum';

export class Announcement extends BaseEntity {
  title!: string;
  content!: string; // HTML destekli içerik
  category!: AnnouncementCategory;
  priority!: AnnouncementPriority;
  status!: AnnouncementStatus;
  siteId?: number | null;
  publishedAt?: Date | null;
  expiresAt?: Date | null;
  isPinned!: boolean;
  targetAudience!: TargetAudienceType;
  targetIds?: number[] | null; // Hedef ID'ler (blok, daire veya kullanıcı ID'leri)

  constructor(props?: Partial<Announcement>) {
    super(props);
    if (props) {
      Object.assign(this, props);
    }
  }

  public isPublished(): boolean {
    return this.status === AnnouncementStatus.PUBLISHED;
  }

  public isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  public canBeViewedBy(userId: number, userSiteId?: number, userUnitIds?: number[]): boolean {
    // Sadece yayında olan duyurular görüntülenebilir
    if (!this.isPublished()) return false;

    // Süresi dolmuşsa görüntülenemez
    if (this.isExpired()) return false;

    // Hedef kitle kontrolü
    switch (this.targetAudience) {
      case TargetAudienceType.ALL:
        return true;
      case TargetAudienceType.SITE:
        return this.siteId === userSiteId;
      case TargetAudienceType.USERS:
        return this.targetIds?.includes(userId) ?? false;
      case TargetAudienceType.UNITS:
        return userUnitIds?.some(id => this.targetIds?.includes(id)) ?? false;
      case TargetAudienceType.BLOCKS:
        // Block kontrolü için unit'lerden block'ları çıkarmak gerekir
        // Bu logic service layer'da implement edilebilir
        return true; // Placeholder
      default:
        return false;
    }
  }
}

