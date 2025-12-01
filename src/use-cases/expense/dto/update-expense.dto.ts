import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';
import { IsOptional, IsNumber, IsString, IsDate, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseType } from '../../../core/entities/expense.entity';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @IsEnum(ExpenseType)
  @IsOptional()
  type?: ExpenseType;
}

