import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsDate,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PollResultVisibility } from '../../../core/entities/poll-result-visibility.enum';
import { PollResponseEditable } from '../../../core/entities/poll-response-editable.enum';
import { TargetAudienceType } from '../../../core/entities/target-audience-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePollDto {
  @ApiProperty({ description: 'Anket başlığı' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Anket açıklaması' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Site ID (opsiyonel)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  siteId?: number;

  @ApiPropertyOptional({ description: 'Başlangıç tarihi (opsiyonel)' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Bitiş tarihi (opsiyonel)' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    enum: PollResultVisibility,
    description: 'Sonuç görünürlüğü',
    default: PollResultVisibility.AFTER_CLOSED,
  })
  @IsEnum(PollResultVisibility)
  @IsOptional()
  resultVisibility?: PollResultVisibility = PollResultVisibility.AFTER_CLOSED;

  @ApiProperty({
    enum: PollResponseEditable,
    description: 'Yanıt düzenlenebilirliği',
    default: PollResponseEditable.UNTIL_CLOSED,
  })
  @IsEnum(PollResponseEditable)
  @IsOptional()
  responseEditable?: PollResponseEditable = PollResponseEditable.UNTIL_CLOSED;

  @ApiProperty({ enum: TargetAudienceType, description: 'Hedef kitle tipi', default: TargetAudienceType.ALL })
  @IsEnum(TargetAudienceType)
  @IsNotEmpty()
  targetAudience!: TargetAudienceType;

  @ApiPropertyOptional({ description: 'Hedef ID\'ler (blok, daire veya kullanıcı ID\'leri)', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  targetIds?: number[];

  @ApiPropertyOptional({ description: 'Ankete eklenecek dosya IDleri' })
  @IsInt({ each: true })
  @Min(1, { each: true })
  @IsOptional()
  fileIds?: number[];
}

