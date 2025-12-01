import { Injectable } from '@nestjs/common';
import { IScheduledTaskRepository } from '../../core/repositories/i-scheduled-task.repository';
import { ScheduledTask, TaskStatus } from '../../core/entities/scheduled-task.entity';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduledTaskMapper } from '../mappers/scheduled-task.mapper';

@Injectable()
export class PrismaScheduledTaskRepository implements IScheduledTaskRepository {
  constructor(private prisma: PrismaService) {}

  async create(task: ScheduledTask): Promise<ScheduledTask> {
    const data = ScheduledTaskMapper.toPersistence(task);
    const created = await this.prisma.scheduledTask.create({ data });
    return ScheduledTaskMapper.toDomain(created);
  }

  async findAll(): Promise<ScheduledTask[]> {
    const tasks = await this.prisma.scheduledTask.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(ScheduledTaskMapper.toDomain);
  }

  async findById(id: number): Promise<ScheduledTask | null> {
    const task = await this.prisma.scheduledTask.findUnique({ where: { id } });
    if (!task || task.deletedAt) return null;
    return ScheduledTaskMapper.toDomain(task);
  }

  async update(id: number, task: Partial<ScheduledTask>): Promise<ScheduledTask> {
    const updateData: any = {};
    if (task.name !== undefined) updateData.name = task.name;
    if (task.description !== undefined) updateData.description = task.description;
    if (task.handlerName !== undefined) updateData.handlerName = task.handlerName;
    if (task.cronExpression !== undefined) updateData.cronExpression = task.cronExpression;
    if (task.scheduleType !== undefined) updateData.scheduleType = task.scheduleType;
    if (task.intervalValue !== undefined) updateData.intervalValue = task.intervalValue;
    if (task.startDate !== undefined) updateData.startDate = task.startDate;
    if (task.endDate !== undefined) updateData.endDate = task.endDate;
    if (task.status !== undefined) updateData.status = task.status;
    if (task.maxRetries !== undefined) updateData.maxRetries = task.maxRetries;
    if (task.retryDelay !== undefined) updateData.retryDelay = task.retryDelay;
    if (task.payload !== undefined) updateData.payload = task.payload;
    if (task.config !== undefined) updateData.config = task.config;

    const updated = await this.prisma.scheduledTask.update({
      where: { id },
      data: updateData,
    });
    return ScheduledTaskMapper.toDomain(updated);
  }

  async delete(id: number, deletedById?: number): Promise<void> {
    await this.prisma.scheduledTask.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findByStatus(status: TaskStatus): Promise<ScheduledTask[]> {
    const tasks = await this.prisma.scheduledTask.findMany({
      where: {
        status,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(ScheduledTaskMapper.toDomain);
  }

  async findByHandlerName(handlerName: string): Promise<ScheduledTask[]> {
    const tasks = await this.prisma.scheduledTask.findMany({
      where: {
        handlerName,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(ScheduledTaskMapper.toDomain);
  }

  async findActive(): Promise<ScheduledTask[]> {
    const tasks = await this.prisma.scheduledTask.findMany({
      where: {
        status: TaskStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(ScheduledTaskMapper.toDomain);
  }
}

