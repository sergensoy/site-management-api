import { IsNotEmpty, IsInt, IsNumber, IsString, IsDate, IsEnum, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseType } from '../../../core/entities/expense.entity';

export class CreateDebtDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  payerId!: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  unitId!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ExpenseType)
  @IsNotEmpty()
  type!: ExpenseType;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dueDate!: Date;
}

