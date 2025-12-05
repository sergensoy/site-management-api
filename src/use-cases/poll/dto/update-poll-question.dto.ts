import { PartialType } from '@nestjs/swagger';
import { CreatePollQuestionDto } from './create-poll-question.dto';

export class UpdatePollQuestionDto extends PartialType(CreatePollQuestionDto) {}

