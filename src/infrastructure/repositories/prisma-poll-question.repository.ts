import { Injectable } from '@nestjs/common';
import { IPollQuestionRepository } from '../../core/repositories/i-poll-question.repository';
import { PollQuestion } from '../../core/entities/poll-question.entity';
import { PrismaService } from '../prisma/prisma.service';
import { PollQuestionMapper } from '../mappers/poll-question.mapper';

@Injectable()
export class PrismaPollQuestionRepository implements IPollQuestionRepository {
  constructor(private prisma: PrismaService) {}

  async create(question: PollQuestion): Promise<PollQuestion> {
    const data = PollQuestionMapper.toPersistence(question);
    const created = await this.prisma.pollQuestion.create({ data });
    return PollQuestionMapper.toDomain(created);
  }

  async update(id: number, question: Partial<PollQuestion>): Promise<PollQuestion> {
    const updated = await this.prisma.pollQuestion.update({
      where: { id },
      data: PollQuestionMapper.toPersistence(question),
    });
    return PollQuestionMapper.toDomain(updated);
  }

  async findById(id: number): Promise<PollQuestion | null> {
    const question = await this.prisma.pollQuestion.findUnique({ where: { id } });
    return question ? PollQuestionMapper.toDomain(question) : null;
  }

  async findAll(): Promise<PollQuestion[]> {
    const questions = await this.prisma.pollQuestion.findMany({
      orderBy: { order: 'asc' },
    });
    return questions.map(PollQuestionMapper.toDomain);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.pollQuestion.delete({ where: { id } });
  }

  async findByPoll(pollId: number): Promise<PollQuestion[]> {
    const questions = await this.prisma.pollQuestion.findMany({
      where: { pollId },
      orderBy: { order: 'asc' },
    });
    return questions.map(PollQuestionMapper.toDomain);
  }

  async deleteByPoll(pollId: number): Promise<void> {
    await this.prisma.pollQuestion.deleteMany({
      where: { pollId },
    });
  }
}

