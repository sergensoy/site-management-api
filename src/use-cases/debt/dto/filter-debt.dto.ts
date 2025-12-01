import { IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterDebtDto {
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
  unitId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  payerId?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPaid?: boolean;
}

