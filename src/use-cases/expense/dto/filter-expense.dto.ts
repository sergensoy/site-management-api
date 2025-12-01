import { IsOptional, IsInt, IsDate, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseType } from '../../../core/entities/expense.entity';

export class FilterExpenseDto {
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
  @IsInt()
  @Type(() => Number)
  siteId?: number;

  @IsOptional()
  @IsEnum(ExpenseType)
  type?: ExpenseType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateTo?: Date;
}

