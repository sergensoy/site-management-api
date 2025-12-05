import { PollResponseAnswer as PrismaPollResponseAnswer, Prisma } from '@prisma/client';
import { PollResponseAnswer } from '../../core/entities/poll-response-answer.entity';

export class PollResponseAnswerMapper {
  static toDomain(raw: PrismaPollResponseAnswer): PollResponseAnswer {
    // selectedOptionIds JSON'dan number[]'e çevir
    let selectedOptionIds: number[] | null = null;
    if (raw.selectedOptionIds) {
      try {
        selectedOptionIds = Array.isArray(raw.selectedOptionIds)
          ? (raw.selectedOptionIds as any[]).map(id => Number(id))
          : null;
      } catch {
        selectedOptionIds = null;
      }
    }

    return new PollResponseAnswer({
      id: raw.id,
      responseId: raw.responseId,
      questionId: raw.questionId,
      answerText: raw.answerText,
      answerNumber: raw.answerNumber ? Number(raw.answerNumber) : null,
      answerDate: raw.answerDate,
      selectedOptionIds,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(answer: Partial<PollResponseAnswer>): Prisma.PollResponseAnswerUncheckedCreateInput {
    return {
      responseId: answer.responseId!,
      questionId: answer.questionId!,
      answerText: answer.answerText,
      answerNumber: answer.answerNumber,
      answerDate: answer.answerDate,
      selectedOptionIds: answer.selectedOptionIds ? answer.selectedOptionIds : undefined,
    };
  }
}

