import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateSiteDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() city?: string;
  @IsNumber() @Min(0) @IsOptional() defaultDues?: number;
}