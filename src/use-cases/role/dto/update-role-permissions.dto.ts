import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  permissionIds!: number[];
}