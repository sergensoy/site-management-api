import { ScheduledTask as PrismaScheduledTask, Prisma } from '@prisma/client';
import { ScheduledTask, ScheduleType, TaskStatus } from '../../core/entities/scheduled-task.entity';

export class ScheduledTaskMapper {
  static toDomain(raw: PrismaScheduledTask): ScheduledTask {
    return new ScheduledTask({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      handlerName: raw.handlerName,
      cronExpression: raw.cronExpression,
      scheduleType: raw.scheduleType as ScheduleType,
      intervalValue: raw.intervalValue,
      startDate: raw.startDate,
      endDate: raw.endDate,
      status: raw.status as TaskStatus,
      maxRetries: raw.maxRetries,
      retryDelay: raw.retryDelay,
      payload: raw.payload,
      config: raw.config,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: null, // Schema'da yok
      updatedById: null,
      deletedById: null,
    });
  }

  static toPersistence(task: Partial<ScheduledTask>): Prisma.ScheduledTaskUncheckedCreateInput {
    return {
      name: task.name!,
      description: task.description,
      handlerName: task.handlerName!,
      cronExpression: task.cronExpression,
      scheduleType: task.scheduleType!,
      intervalValue: task.intervalValue,
      startDate: task.startDate,
      endDate: task.endDate,
      status: task.status!,
      maxRetries: task.maxRetries ?? 3,
      retryDelay: task.retryDelay ?? 60,
      payload: task.payload,
      config: task.config,
      createdById: task.createdById,
      deletedAt: task.deletedAt,
    };
  }
}

