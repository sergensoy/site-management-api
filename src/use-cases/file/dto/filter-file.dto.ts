import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FileCategory } from '../../../core/entities/file-category.enum';
import { FileStatus } from '../../../core/entities/file-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterFileDto {
  @ApiPropertyOptional({ enum: FileCategory })
  @IsEnum(FileCategory)
  @IsOptional()
  category?: FileCategory;

  @ApiPropertyOptional({ enum: FileStatus })
  @IsEnum(FileStatus)
  @IsOptional()
  status?: FileStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string; // Original name'de arama

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  entityId?: number;
}

