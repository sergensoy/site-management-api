import { PartialType } from '@nestjs/swagger';
import { CreateDebtDto } from './create-debt.dto';
import { IsOptional, IsNumber, IsString, IsDate, IsEnum, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseType } from '../../../core/entities/expense.entity';

export class UpdateDebtDto extends PartialType(CreateDebtDto) {
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
  dueDate?: Date;

  @IsEnum(ExpenseType)
  @IsOptional()
  type?: ExpenseType;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}

