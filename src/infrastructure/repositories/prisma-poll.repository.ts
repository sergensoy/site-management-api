import { Injectable } from '@nestjs/common';
import { IPollRepository } from '../../core/repositories/i-poll.repository';
import { Poll } from '../../core/entities/poll.entity';
import { PrismaService } from '../prisma/prisma.service';
import { PollMapper } from '../mappers/poll.mapper';
import { PollStatus } from '../../core/entities/poll-status.enum';

@Injectable()
export class PrismaPollRepository implements IPollRepository {
  constructor(private prisma: PrismaService) {}

  async create(poll: Poll): Promise<Poll> {
    const data = PollMapper.toPersistence(poll);
    const created = await this.prisma.poll.create({ data });
    return PollMapper.toDomain(created);
  }

  async update(id: number, poll: Partial<Poll>): Promise<Poll> {
    const updated = await this.prisma.poll.update({
      where: { id },
      data: PollMapper.toPersistence(poll),
    });
    return PollMapper.toDomain(updated);
  }

  async findById(id: number): Promise<Poll | null> {
    const poll = await this.prisma.poll.findUnique({ where: { id } });
    if (!poll || poll.deletedAt) return null;
    return PollMapper.toDomain(poll);
  }

  async findAll(): Promise<Poll[]> {
    const polls = await this.prisma.poll.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return polls.map(PollMapper.toDomain);
  }

  async delete(id: number, deletedById?: number): Promise<void> {
    await this.prisma.poll.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  }

  async findByStatus(status: PollStatus): Promise<Poll[]> {
    const polls = await this.prisma.poll.findMany({
      where: { status, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return polls.map(PollMapper.toDomain);
  }

  async findActive(): Promise<Poll[]> {
    const now = new Date();
    const polls = await this.prisma.poll.findMany({
      where: {
        status: PollStatus.PUBLISHED,
        deletedAt: null,
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return polls.map(PollMapper.toDomain);
  }

  async findExpired(): Promise<Poll[]> {
    const now = new Date();
    const polls = await this.prisma.poll.findMany({
      where: {
        status: PollStatus.PUBLISHED,
        endDate: { lte: now },
        deletedAt: null,
      },
    });
    return polls.map(PollMapper.toDomain);
  }

  async findBySite(siteId: number): Promise<Poll[]> {
    const polls = await this.prisma.poll.findMany({
      where: { siteId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return polls.map(PollMapper.toDomain);
  }

  async findByCreator(createdById: number): Promise<Poll[]> {
    const polls = await this.prisma.poll.findMany({
      where: { createdById, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return polls.map(PollMapper.toDomain);
  }
}

