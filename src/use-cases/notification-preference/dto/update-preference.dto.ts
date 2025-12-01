import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePreferenceDto {
  @IsNotEmpty()
  @IsNumber()
  userId!: number;

  @IsNotEmpty()
  category!: string;

  @IsNotEmpty()
  channel!: string;

  @IsBoolean()
  enabled!: boolean;
}

