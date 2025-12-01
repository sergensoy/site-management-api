import { PartialType } from '@nestjs/swagger';
import { CreateResidencyDto } from './create-residency.dto';
import { IsOptional, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ResidencyType } from '../../../core/entities/residency.entity';

export class UpdateResidencyDto extends PartialType(CreateResidencyDto) {
  @IsEnum(ResidencyType)
  @IsOptional()
  type?: ResidencyType;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  moveInDate?: Date;
}

