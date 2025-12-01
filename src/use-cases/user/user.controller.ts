import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('users')
@DefineResource('user', 'Kullanıcı')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermissions('user.create')
  create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    return this.userService.create(createUserDto, req.user.id);
  }

  @Get()
  @RequirePermissions('user.view')
  findAll(@Query() filterDto: FilterUserDto) {
    return this.userService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('user.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('user.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    return this.userService.update(id, updateUserDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('user.delete')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.userService.remove(id, req.user.id);
  }

  @Patch(':id/password')
  @RequirePermissions('user.update')
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ) {
    return this.userService.changePassword(id, changePasswordDto, req.user.id);
  }

  @Patch(':id/role')
  @RequirePermissions('user.update')
  assignRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignRoleDto: AssignRoleDto,
    @Request() req: any,
  ) {
    return this.userService.assignRole(id, assignRoleDto, req.user.id);
  }

  @Patch(':id/activate')
  @RequirePermissions('user.update')
  activate(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.userService.activate(id, req.user.id);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('user.update')
  deactivate(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.userService.deactivate(id, req.user.id);
  }
}

