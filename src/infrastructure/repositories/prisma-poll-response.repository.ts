import { Injectable } from '@nestjs/common';
import { IPollResponseRepository } from '../../core/repositories/i-poll-response.repository';
import { PollResponse } from '../../core/entities/poll-response.entity';
import { PrismaService } from '../prisma/prisma.service';
import { PollResponseMapper } from '../mappers/poll-response.mapper';

@Injectable()
export class PrismaPollResponseRepository implements IPollResponseRepository {
  constructor(private prisma: PrismaService) {}

  async create(response: PollResponse): Promise<PollResponse> {
    const data = PollResponseMapper.toPersistence(response);
    const created = await this.prisma.pollResponse.create({ data });
    return PollResponseMapper.toDomain(created);
  }

  async update(id: number, response: Partial<PollResponse>): Promise<PollResponse> {
    const updated = await this.prisma.pollResponse.update({
      where: { id },
      data: PollResponseMapper.toPersistence(response),
    });
    return PollResponseMapper.toDomain(updated);
  }

  async findById(id: number): Promise<PollResponse | null> {
    const response = await this.prisma.pollResponse.findUnique({ where: { id } });
    return response ? PollResponseMapper.toDomain(response) : null;
  }

  async findAll(): Promise<PollResponse[]> {
    const responses = await this.prisma.pollResponse.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return responses.map(PollResponseMapper.toDomain);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.pollResponse.delete({ where: { id } });
  }

  async findByPoll(pollId: number): Promise<PollResponse[]> {
    const responses = await this.prisma.pollResponse.findMany({
      where: { pollId },
      orderBy: { createdAt: 'desc' },
    });
    return responses.map(PollResponseMapper.toDomain);
  }

  async findByUser(userId: number): Promise<PollResponse[]> {
    const responses = await this.prisma.pollResponse.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return responses.map(PollResponseMapper.toDomain);
  }

  async findByPollAndUser(pollId: number, userId: number): Promise<PollResponse | null> {
    const response = await this.prisma.pollResponse.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId,
        },
      },
    });
    return response ? PollResponseMapper.toDomain(response) : null;
  }

  async getResponseCount(pollId: number): Promise<number> {
    return this.prisma.pollResponse.count({
      where: { pollId },
    });
  }
}

