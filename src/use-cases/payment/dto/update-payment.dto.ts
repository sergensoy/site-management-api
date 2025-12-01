import { PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto';
import { IsOptional, IsNumber, IsDate, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../core/entities/payment.entity';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  amount?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  paymentDate?: Date;

  @IsString()
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: string;
}

