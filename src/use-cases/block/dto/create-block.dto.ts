import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  siteId!: number;
}