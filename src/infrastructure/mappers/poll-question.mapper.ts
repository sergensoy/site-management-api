import { PollQuestion as PrismaPollQuestion, Prisma } from '@prisma/client';
import { PollQuestion } from '../../core/entities/poll-question.entity';
import { PollQuestionType } from '../../core/entities/poll-question-type.enum';

export class PollQuestionMapper {
  static toDomain(raw: PrismaPollQuestion): PollQuestion {
    return new PollQuestion({
      id: raw.id,
      pollId: raw.pollId,
      questionText: raw.questionText,
      questionType: raw.questionType as PollQuestionType,
      order: raw.order,
      isRequired: raw.isRequired,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(question: Partial<PollQuestion>): Prisma.PollQuestionUncheckedCreateInput {
    return {
      pollId: question.pollId!,
      questionText: question.questionText!,
      questionType: question.questionType!,
      order: question.order ?? 0,
      isRequired: question.isRequired ?? false,
    };
  }
}

