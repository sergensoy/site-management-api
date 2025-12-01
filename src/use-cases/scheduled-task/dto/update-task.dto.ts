import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsEnum, IsString, IsInt, IsDate, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleType, TaskStatus } from '../../../core/entities/scheduled-task.entity';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ScheduleType)
  @IsOptional()
  scheduleType?: ScheduleType;

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

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsObject()
  @IsOptional()
  payload?: any;
}

