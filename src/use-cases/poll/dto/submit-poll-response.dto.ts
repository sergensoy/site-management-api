import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PollAnswerDto {
  @ApiProperty({ description: 'Soru ID' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  questionId!: number;

  @ApiPropertyOptional({ description: 'Metin yanıtı (SHORT_TEXT, LONG_TEXT için)' })
  @IsString()
  @IsOptional()
  answerText?: string;

  @ApiPropertyOptional({ description: 'Sayısal yanıt (NUMBER için)' })
  @IsNumber()
  @IsOptional()
  answerNumber?: number;

  @ApiPropertyOptional({ description: 'Tarih yanıtı (DATE için)' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  answerDate?: Date;

  @ApiPropertyOptional({
    description: 'Seçilen seçenek ID\'leri (SINGLE_CHOICE, MULTIPLE_CHOICE için)',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  selectedOptionIds?: number[];
}

export class SubmitPollResponseDto {
  @ApiProperty({ description: 'Yanıtlar', type: [PollAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PollAnswerDto)
  @IsNotEmpty()
  answers!: PollAnswerDto[];
}

