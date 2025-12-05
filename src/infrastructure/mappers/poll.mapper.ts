import { Poll as PrismaPoll, Prisma } from '@prisma/client';
import { Poll } from '../../core/entities/poll.entity';
import { PollStatus } from '../../core/entities/poll-status.enum';
import { PollResultVisibility } from '../../core/entities/poll-result-visibility.enum';
import { PollResponseEditable } from '../../core/entities/poll-response-editable.enum';
import { TargetAudienceType } from '../../core/entities/target-audience-type.enum';

export class PollMapper {
  static toDomain(raw: PrismaPoll): Poll {
    // targetIds JSON'dan number[]'e çevir
    let targetIds: number[] | null = null;
    if (raw.targetIds) {
      try {
        targetIds = Array.isArray(raw.targetIds)
          ? (raw.targetIds as any[]).map(id => Number(id))
          : null;
      } catch {
        targetIds = null;
      }
    }

    return new Poll({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      status: raw.status as PollStatus,
      siteId: raw.siteId,
      createdById: raw.createdById,
      startDate: raw.startDate,
      endDate: raw.endDate,
      resultVisibility: raw.resultVisibility as PollResultVisibility,
      responseEditable: raw.responseEditable as PollResponseEditable,
      targetAudience: raw.targetAudience as TargetAudienceType,
      targetIds,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toPersistence(poll: Partial<Poll>): Prisma.PollUncheckedCreateInput {
    return {
      title: poll.title!,
      description: poll.description,
      status: poll.status!,
      siteId: poll.siteId,
      createdById: poll.createdById!,
      startDate: poll.startDate,
      endDate: poll.endDate,
      resultVisibility: poll.resultVisibility!,
      responseEditable: poll.responseEditable!,
      targetAudience: poll.targetAudience!,
      targetIds: poll.targetIds ? poll.targetIds : undefined,
      updatedById: poll.updatedById,
      deletedById: poll.deletedById,
      deletedAt: poll.deletedAt,
    };
  }
}

