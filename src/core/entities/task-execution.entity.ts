import { BaseEntity } from './base.entity';

export enum ExecutionStatus {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class TaskExecution extends BaseEntity {
  taskId!: number;
  status!: ExecutionStatus;
  startedAt!: Date;
  completedAt?: Date | null;
  duration?: number | null;
  result?: any | null;
  error?: string | null;
  retryCount!: number;

  constructor(props?: Partial<TaskExecution>) {
    super(props);
    if (props) {
      this.taskId = props.taskId!;
      this.status = props.status || ExecutionStatus.RUNNING;
      this.startedAt = props.startedAt!;
      this.completedAt = props.completedAt;
      this.duration = props.duration;
      this.result = props.result;
      this.error = props.error;
      this.retryCount = props.retryCount ?? 0;
    }
  }
}

