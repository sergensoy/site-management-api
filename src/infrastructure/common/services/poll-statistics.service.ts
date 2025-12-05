import { Injectable, Inject } from '@nestjs/common';
import { IPollRepository } from '../../../core/repositories/i-poll.repository';
import { IPollQuestionRepository } from '../../../core/repositories/i-poll-question.repository';
import { IPollResponseRepository } from '../../../core/repositories/i-poll-response.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { PollQuestionType } from '../../../core/entities/poll-question-type.enum';

@Injectable()
export class PollStatisticsService {
  constructor(
    @Inject(IPollRepository) private pollRepository: IPollRepository,
    @Inject(IPollQuestionRepository) private questionRepository: IPollQuestionRepository,
    @Inject(IPollResponseRepository) private responseRepository: IPollResponseRepository,
    private prisma: PrismaService,
  ) {}

  async getPollStatistics(pollId: number) {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const totalResponses = await this.responseRepository.getResponseCount(pollId);
    const questions = await this.questionRepository.findByPoll(pollId);

    const questionStatistics = await Promise.all(
      questions.map(async (question) => {
        return this.getQuestionStatistics(question.id, question.questionType, totalResponses);
      }),
    );

    return {
      pollId,
      pollTitle: poll.title,
      totalResponses,
      totalQuestions: questions.length,
      questions: questionStatistics,
    };
  }

  private async getQuestionStatistics(
    questionId: number,
    questionType: PollQuestionType,
    totalResponses: number,
  ) {
    const answers = await this.prisma.pollResponseAnswer.findMany({
      where: { questionId },
    });

    if (questionType === PollQuestionType.SINGLE_CHOICE || questionType === PollQuestionType.MULTIPLE_CHOICE) {
      // Seçenek bazlı istatistikler
      const optionCounts: Record<number, number> = {};
      answers.forEach((answer) => {
        if (answer.selectedOptionIds) {
          const optionIds = Array.isArray(answer.selectedOptionIds)
            ? (answer.selectedOptionIds as any[]).map(id => Number(id))
            : [];
          optionIds.forEach((optionId) => {
            optionCounts[optionId] = (optionCounts[optionId] || 0) + 1;
          });
        }
      });

      const optionStats = Object.entries(optionCounts).map(([optionId, count]) => ({
        optionId: Number(optionId),
        count,
        percentage: totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(2) : '0.00',
      }));

      return {
        questionId,
        questionType,
        totalAnswers: answers.length,
        optionStatistics: optionStats,
      };
    } else if (questionType === PollQuestionType.NUMBER) {
      // Sayısal istatistikler
      const numbers = answers
        .map(a => a.answerNumber ? Number(a.answerNumber) : null)
        .filter(n => n !== null) as number[];

      const sum = numbers.reduce((acc, n) => acc + n, 0);
      const average = numbers.length > 0 ? sum / numbers.length : 0;
      const min = numbers.length > 0 ? Math.min(...numbers) : null;
      const max = numbers.length > 0 ? Math.max(...numbers) : null;

      return {
        questionId,
        questionType,
        totalAnswers: answers.length,
        average: average.toFixed(2),
        min,
        max,
        sum: sum.toFixed(2),
      };
    } else {
      // Metin ve tarih soruları için basit sayım
      return {
        questionId,
        questionType,
        totalAnswers: answers.length,
      };
    }
  }
}

