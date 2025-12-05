import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AnnouncementCategory } from '../../../core/entities/announcement-category.enum';
import { AnnouncementPriority } from '../../../core/entities/announcement-priority.enum';
import { TargetAudienceType } from '../../../core/entities/target-audience-type.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({ description: 'Duyuru başlığı' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Duyuru içeriği (HTML destekli)' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ enum: AnnouncementCategory, description: 'Duyuru kategorisi' })
  @IsEnum(AnnouncementCategory)
  @IsOptional()
  category?: AnnouncementCategory;

  @ApiPropertyOptional({ enum: AnnouncementPriority, description: 'Öncelik seviyesi' })
  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

  @ApiPropertyOptional({ description: 'Site ID' })
  @IsInt()
  @Min(1)
  @IsOptional()
  siteId?: number;

  @ApiPropertyOptional({ description: 'Yayın tarihi' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  publishedAt?: Date;

  @ApiPropertyOptional({ description: 'Son geçerlilik tarihi' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Sabitlenmiş mi?' })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @ApiPropertyOptional({ enum: TargetAudienceType, description: 'Hedef kitle tipi' })
  @IsEnum(TargetAudienceType)
  @IsOptional()
  targetAudience?: TargetAudienceType;

  @ApiPropertyOptional({ description: 'Hedef ID\'ler', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  targetIds?: number[];
}

