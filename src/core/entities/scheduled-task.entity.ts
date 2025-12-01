import { BaseEntity } from './base.entity';

export enum ScheduleType {
  CRON = 'CRON',
  INTERVAL = 'INTERVAL',
  ONCE = 'ONCE',
}

export enum TaskStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DISABLED = 'DISABLED',
}

export class ScheduledTask extends BaseEntity {
  name!: string;
  description?: string | null;
  handlerName!: string;
  cronExpression?: string | null;
  scheduleType!: ScheduleType;
  intervalValue?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  status!: TaskStatus;
  maxRetries!: number;
  retryDelay!: number;
  payload?: any | null;
  config?: any | null;

  constructor(props?: Partial<ScheduledTask>) {
    super(props);
    if (props) {
      this.name = props.name!;
      this.description = props.description;
      this.handlerName = props.handlerName!;
      this.cronExpression = props.cronExpression;
      this.scheduleType = props.scheduleType!;
      this.intervalValue = props.intervalValue;
      this.startDate = props.startDate;
      this.endDate = props.endDate;
      this.status = props.status || TaskStatus.ACTIVE;
      this.maxRetries = props.maxRetries ?? 3;
      this.retryDelay = props.retryDelay ?? 60;
      this.payload = props.payload;
      this.config = props.config;
    }
  }
}

