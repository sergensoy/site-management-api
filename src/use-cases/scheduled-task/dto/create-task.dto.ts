import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, IsDate, Min, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleType } from '../../../core/entities/scheduled-task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  handlerName!: string;

  @IsEnum(ScheduleType)
  @IsNotEmpty()
  scheduleType!: ScheduleType;

  @IsString()
  @IsOptional()
  cronExpression?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  intervalValue?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsInt()
  @IsOptional()
  @Min(0)
  maxRetries?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  retryDelay?: number;

  @IsObject()
  @IsOptional()
  payload?: any;

  @IsObject()
  @IsOptional()
  config?: any;
}

