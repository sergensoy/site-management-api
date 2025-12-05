import { PollOption as PrismaPollOption, Prisma } from '@prisma/client';
import { PollOption } from '../../core/entities/poll-option.entity';

export class PollOptionMapper {
  static toDomain(raw: PrismaPollOption): PollOption {
    return new PollOption({
      id: raw.id,
      questionId: raw.questionId,
      optionText: raw.optionText,
      order: raw.order,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(option: Partial<PollOption>): Prisma.PollOptionUncheckedCreateInput {
    return {
      questionId: option.questionId!,
      optionText: option.optionText!,
      order: option.order ?? 0,
    };
  }
}

