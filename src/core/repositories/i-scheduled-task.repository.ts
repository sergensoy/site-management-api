import { IGenericRepository } from './i-generic.repository';
import { ScheduledTask, TaskStatus } from '../entities/scheduled-task.entity';

export interface IScheduledTaskRepository extends IGenericRepository<ScheduledTask> {
  findByStatus(status: TaskStatus): Promise<ScheduledTask[]>;
  findByHandlerName(handlerName: string): Promise<ScheduledTask[]>;
  findActive(): Promise<ScheduledTask[]>;
}

export const IScheduledTaskRepository = Symbol('IScheduledTaskRepository');

