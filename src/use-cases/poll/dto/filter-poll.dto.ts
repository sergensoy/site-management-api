import { IsEnum, IsOptional, IsInt, IsString, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PollStatus } from '../../../core/entities/poll-status.enum';
import { TargetAudienceType } from '../../../core/entities/target-audience-type.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterPollDto {
  @ApiPropertyOptional({ enum: PollStatus })
  @IsEnum(PollStatus)
  @IsOptional()
  status?: PollStatus;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  siteId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string; // Başlıkta arama

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDateFrom?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDateTo?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDateFrom?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDateTo?: Date;

  @ApiPropertyOptional({ enum: TargetAudienceType })
  @IsEnum(TargetAudienceType)
  @IsOptional()
  targetAudience?: TargetAudienceType;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  limit?: number;
}

