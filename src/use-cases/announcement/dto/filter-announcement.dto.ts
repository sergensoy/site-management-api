import { IsEnum, IsOptional, IsInt, IsString, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { AnnouncementCategory } from '../../../core/entities/announcement-category.enum';
import { AnnouncementStatus } from '../../../core/entities/announcement-status.enum';
import { AnnouncementPriority } from '../../../core/entities/announcement-priority.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAnnouncementDto {
  @ApiPropertyOptional({ enum: AnnouncementCategory })
  @IsEnum(AnnouncementCategory)
  @IsOptional()
  category?: AnnouncementCategory;

  @ApiPropertyOptional({ enum: AnnouncementStatus })
  @IsEnum(AnnouncementStatus)
  @IsOptional()
  status?: AnnouncementStatus;

  @ApiPropertyOptional({ enum: AnnouncementPriority })
  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

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
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateTo?: Date;

  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isPinned?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  limit?: number;
}

