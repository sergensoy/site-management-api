import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AssignRoleDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  roleId!: number;
}

