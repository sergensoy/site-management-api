import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FileCategory } from '../../../core/entities/file-category.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiPropertyOptional({ enum: FileCategory, description: 'Dosya kategorisi' })
  @IsEnum(FileCategory)
  @IsOptional()
  category?: FileCategory;

  @ApiPropertyOptional({ description: 'Dosya açıklaması' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Entity tipi (Expense, Site, Unit, vb.)' })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID' })
  @IsOptional()
  entityId?: number;
}

