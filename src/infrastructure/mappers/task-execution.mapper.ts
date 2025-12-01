import { TaskExecution as PrismaTaskExecution } from '@prisma/client';
import { TaskExecution, ExecutionStatus } from '../../core/entities/task-execution.entity';

export class TaskExecutionMapper {
  static toDomain(raw: PrismaTaskExecution): TaskExecution {
    return new TaskExecution({
      id: raw.id,
      taskId: raw.taskId,
      status: raw.status as ExecutionStatus,
      startedAt: raw.startedAt,
      completedAt: raw.completedAt,
      duration: raw.duration,
      result: raw.result,
      error: raw.error,
      retryCount: raw.retryCount,
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt, // Schema'da updatedAt yok
      deletedAt: null,
    });
  }
}

