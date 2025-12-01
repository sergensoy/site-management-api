import { IsNotEmpty, IsInt, IsNumber, IsString, IsDate, IsEnum, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../core/entities/payment.entity';

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  debtId!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount!: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  paymentDate?: Date;

  @IsString()
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: string;
}

