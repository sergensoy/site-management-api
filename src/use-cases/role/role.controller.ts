import { Controller, Get, Post, Body, Put, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from 'src/infrastructure/common/decorators/define-resource.decorator';

@Controller('roles')
@DefineResource('roles', 'Rol')
@UseGuards(AuthGuard('jwt'), PermissionsGuard) // JWT ve Yetki Koruması
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions('rbac.manage_roles') // Bu yetkiye sahip olanlar rol oluşturabilir
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto.name, createRoleDto.description);
  }

  @Get()
  @RequirePermissions('rbac.manage_roles')
  findAll() {
    return this.roleService.findAll();
  }

  @Put(':id/permissions')
  @RequirePermissions('rbac.manage_roles')
  updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRolePermissionsDto,
  ) {
    return this.roleService.updateRolePermissions(id, updateDto.permissionIds);
  }
}