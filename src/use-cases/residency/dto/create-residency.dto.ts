import { IsNotEmpty, IsInt, IsEnum, IsDate, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ResidencyType } from '../../../core/entities/residency.entity';

export class CreateResidencyDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  unitId!: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  userId!: number;

  @IsEnum(ResidencyType)
  @IsNotEmpty()
  type!: ResidencyType;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  moveInDate?: Date;
}

