import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class MoveOutDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  moveOutDate?: Date;
}

