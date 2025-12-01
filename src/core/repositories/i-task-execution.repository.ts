import { TaskExecution, ExecutionStatus } from '../entities/task-execution.entity';

export interface ITaskExecutionRepository {
  create(execution: TaskExecution): Promise<TaskExecution>;
  findById(id: number): Promise<TaskExecution | null>;
  findByTaskId(taskId: number): Promise<TaskExecution[]>;
  findByStatus(status: ExecutionStatus): Promise<TaskExecution[]>;
  update(id: number, execution: Partial<TaskExecution>): Promise<TaskExecution>;
  findLatestByTaskId(taskId: number): Promise<TaskExecution | null>;
}

export const ITaskExecutionRepository = Symbol('ITaskExecutionRepository');

