import { IsNotEmpty, IsNumber, IsString, IsDate, IsEnum, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseType } from '../../../core/entities/expense.entity';

export class CreateExpenseDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  siteId!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date!: Date;

  @IsEnum(ExpenseType)
  @IsNotEmpty()
  type!: ExpenseType;
}

