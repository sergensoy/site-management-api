import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PollQuestionType } from '../../../core/entities/poll-question-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePollOptionDto {
  @ApiProperty({ description: 'Seçenek metni' })
  @IsString()
  @IsNotEmpty()
  optionText!: string;

  @ApiPropertyOptional({ description: 'Sıra', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number = 0;
}

export class CreatePollQuestionDto {
  @ApiProperty({ description: 'Soru metni' })
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @ApiProperty({ enum: PollQuestionType, description: 'Soru tipi' })
  @IsEnum(PollQuestionType)
  @IsNotEmpty()
  questionType!: PollQuestionType;

  @ApiPropertyOptional({ description: 'Sıra', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number = 0;

  @ApiPropertyOptional({ description: 'Zorunlu mu?', default: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = false;

  @ApiPropertyOptional({
    description: 'Seçenekler (SINGLE_CHOICE veya MULTIPLE_CHOICE için gerekli)',
    type: [CreatePollOptionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePollOptionDto)
  @IsOptional()
  options?: CreatePollOptionDto[];
}

