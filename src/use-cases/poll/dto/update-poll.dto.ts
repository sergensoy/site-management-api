import { PartialType } from '@nestjs/swagger';
import { CreatePollDto } from './create-poll.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PollStatus } from '../../../core/entities/poll-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePollDto extends PartialType(CreatePollDto) {
  @ApiPropertyOptional({ enum: PollStatus, description: 'Anket durumu' })
  @IsEnum(PollStatus)
  @IsOptional()
  status?: PollStatus;
}

