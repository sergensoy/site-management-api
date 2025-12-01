import { IsNotEmpty, IsString, IsInt, Min, IsOptional, IsNumber } from 'class-validator';

export class CreateUnitDto {
  @IsString()
  @IsNotEmpty()
  unitNumber!: string;

  @IsInt()
  @Min(1)
  blockId!: number;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsNumber()
  @IsOptional()
  shareOfLand?: number;

  @IsInt()
  @IsOptional()
  landlordId?: number; // Ev sahibi (User ID)
}