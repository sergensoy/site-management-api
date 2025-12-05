import { Injectable } from '@nestjs/common';
import { IPollOptionRepository } from '../../core/repositories/i-poll-option.repository';
import { PollOption } from '../../core/entities/poll-option.entity';
import { PrismaService } from '../prisma/prisma.service';
import { PollOptionMapper } from '../mappers/poll-option.mapper';

@Injectable()
export class PrismaPollOptionRepository implements IPollOptionRepository {
  constructor(private prisma: PrismaService) {}

  async create(option: PollOption): Promise<PollOption> {
    const data = PollOptionMapper.toPersistence(option);
    const created = await this.prisma.pollOption.create({ data });
    return PollOptionMapper.toDomain(created);
  }

  async update(id: number, option: Partial<PollOption>): Promise<PollOption> {
    const updated = await this.prisma.pollOption.update({
      where: { id },
      data: PollOptionMapper.toPersistence(option),
    });
    return PollOptionMapper.toDomain(updated);
  }

  async findById(id: number): Promise<PollOption | null> {
    const option = await this.prisma.pollOption.findUnique({ where: { id } });
    return option ? PollOptionMapper.toDomain(option) : null;
  }

  async findAll(): Promise<PollOption[]> {
    const options = await this.prisma.pollOption.findMany({
      orderBy: { order: 'asc' },
    });
    return options.map(PollOptionMapper.toDomain);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.pollOption.delete({ where: { id } });
  }

  async findByQuestion(questionId: number): Promise<PollOption[]> {
    const options = await this.prisma.pollOption.findMany({
      where: { questionId },
      orderBy: { order: 'asc' },
    });
    return options.map(PollOptionMapper.toDomain);
  }

  async deleteByQuestion(questionId: number): Promise<void> {
    await this.prisma.pollOption.deleteMany({
      where: { questionId },
    });
  }
}

