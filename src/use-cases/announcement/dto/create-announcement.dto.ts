import {
  IsNotEmpty,
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'Duyuru başlığı' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Duyuru içeriği (HTML destekli)' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ enum: AnnouncementCategory, description: 'Duyuru kategorisi' })
  @IsEnum(AnnouncementCategory)
  @IsNotEmpty()
  category!: AnnouncementCategory;

  @ApiPropertyOptional({ enum: AnnouncementPriority, description: 'Öncelik seviyesi', default: 'NORMAL' })
  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

  @ApiPropertyOptional({ description: 'Site ID (opsiyonel)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  siteId?: number;

  @ApiPropertyOptional({ description: 'Yayın tarihi (opsiyonel)' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  publishedAt?: Date;

  @ApiPropertyOptional({ description: 'Son geçerlilik tarihi (opsiyonel)' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Sabitlenmiş mi?', default: false })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @ApiProperty({ enum: TargetAudienceType, description: 'Hedef kitle tipi', default: 'ALL' })
  @IsEnum(TargetAudienceType)
  @IsNotEmpty()
  targetAudience!: TargetAudienceType;

  @ApiPropertyOptional({ description: 'Hedef ID\'ler (blok, daire veya kullanıcı ID\'leri)', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  targetIds?: number[];
}

