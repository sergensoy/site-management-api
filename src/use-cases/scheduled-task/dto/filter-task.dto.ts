import { IsOptional, IsInt, IsEnum, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../../../core/entities/scheduled-task.entity';

export class FilterTaskDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  handlerName?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

