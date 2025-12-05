import { BaseEntity } from './base.entity';
import { PollStatus } from './poll-status.enum';
import { PollResultVisibility } from './poll-result-visibility.enum';
import { PollResponseEditable } from './poll-response-editable.enum';
import { TargetAudienceType } from './target-audience-type.enum';

export class Poll extends BaseEntity {
  title!: string;
  description?: string | null;
  status!: PollStatus;
  siteId?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  resultVisibility!: PollResultVisibility;
  responseEditable!: PollResponseEditable;
  targetAudience!: TargetAudienceType;
  targetIds?: number[] | null;

  constructor(props?: Partial<Poll>) {
    super(props);
    if (props) {
      Object.assign(this, props);
    }
  }

  public isActive(): boolean {
    // Status kontrolü
    if (this.status !== PollStatus.PUBLISHED) return false;

    // Tarih kontrolü
    if (this.endDate && new Date() > this.endDate) return false;

    // Başlangıç tarihi kontrolü
    if (this.startDate && new Date() < this.startDate) return false;

    return true;
  }

  public canBeViewedBy(userId: number, userSiteId?: number, userUnitIds?: number[]): boolean {
    // Sadece yayında olan anketler görüntülenebilir
    if (this.status !== PollStatus.PUBLISHED && this.status !== PollStatus.CLOSED) return false;

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

