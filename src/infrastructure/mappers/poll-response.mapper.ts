import { PollResponse as PrismaPollResponse, Prisma } from '@prisma/client';
import { PollResponse } from '../../core/entities/poll-response.entity';

export class PollResponseMapper {
  static toDomain(raw: PrismaPollResponse): PollResponse {
    return new PollResponse({
      id: raw.id,
      pollId: raw.pollId,
      userId: raw.userId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(response: Partial<PollResponse>): Prisma.PollResponseUncheckedCreateInput {
    return {
      pollId: response.pollId!,
      userId: response.userId!,
    };
  }
}

