import { TargetAudienceType } from '../entities/target-audience-type.enum';

export class PollPublishedEvent {
  constructor(
    public readonly pollId: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly createdById: number,
    public readonly targetAudience: TargetAudienceType,
    public readonly siteId?: number | null,
    public readonly targetIds?: number[] | null,
  ) {}
}

