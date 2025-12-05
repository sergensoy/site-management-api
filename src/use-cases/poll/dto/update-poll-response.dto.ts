import { PartialType } from '@nestjs/swagger';
import { SubmitPollResponseDto } from './submit-poll-response.dto';

export class UpdatePollResponseDto extends PartialType(SubmitPollResponseDto) {}

