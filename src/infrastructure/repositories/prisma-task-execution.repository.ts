import { Injectable } from '@nestjs/common';
import { ITaskExecutionRepository } from '../../core/repositories/i-task-execution.repository';
import { TaskExecution, ExecutionStatus } from '../../core/entities/task-execution.entity';
import { PrismaService } from '../prisma/prisma.service';
import { TaskExecutionMapper } from '../mappers/task-execution.mapper';

@Injectable()
export class PrismaTaskExecutionRepository implements ITaskExecutionRepository {
  constructor(private prisma: PrismaService) {}

  async create(execution: TaskExecution): Promise<TaskExecution> {
    const created = await this.prisma.taskExecution.create({
      data: {
        taskId: execution.taskId,
        status: execution.status,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        duration: execution.duration,
        result: execution.result,
        error: execution.error,
        retryCount: execution.retryCount,
      },
    });
    return TaskExecutionMapper.toDomain(created);
  }

  async findById(id: number): Promise<TaskExecution | null> {
    const execution = await this.prisma.taskExecution.findUnique({ where: { id } });
    if (!execution) return null;
    return TaskExecutionMapper.toDomain(execution);
  }

  async findByTaskId(taskId: number): Promise<TaskExecution[]> {
    const executions = await this.prisma.taskExecution.findMany({
      where: { taskId },
      orderBy: { startedAt: 'desc' },
    });
    return executions.map(TaskExecutionMapper.toDomain);
  }

  async findByStatus(status: ExecutionStatus): Promise<TaskExecution[]> {
    const executions = await this.prisma.taskExecution.findMany({
      where: { status },
      orderBy: { startedAt: 'desc' },
    });
    return executions.map(TaskExecutionMapper.toDomain);
  }

  async update(id: number, execution: Partial<TaskExecution>): Promise<TaskExecution> {
    const updateData: any = {};
    if (execution.status !== undefined) updateData.status = execution.status;
    if (execution.completedAt !== undefined) updateData.completedAt = execution.completedAt;
    if (execution.duration !== undefined) updateData.duration = execution.duration;
    if (execution.result !== undefined) updateData.result = execution.result;
    if (execution.error !== undefined) updateData.error = execution.error;
    if (execution.retryCount !== undefined) updateData.retryCount = execution.retryCount;

    const updated = await this.prisma.taskExecution.update({
      where: { id },
      data: updateData,
    });
    return TaskExecutionMapper.toDomain(updated);
  }

  async findLatestByTaskId(taskId: number): Promise<TaskExecution | null> {
    const execution = await this.prisma.taskExecution.findFirst({
      where: { taskId },
      orderBy: { startedAt: 'desc' },
    });
    if (!execution) return null;
    return TaskExecutionMapper.toDomain(execution);
  }
}

