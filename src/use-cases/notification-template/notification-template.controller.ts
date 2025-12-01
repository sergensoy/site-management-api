import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationTemplateService } from './notification-template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { FilterTemplateDto } from './dto/filter-template.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('notification-templates')
@DefineResource('notification-template', 'Bildirim Şablonları')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class NotificationTemplateController {
  constructor(private readonly templateService: NotificationTemplateService) {}

  @Post()
  @RequirePermissions('notification-template.create')
  create(@Body() createDto: CreateTemplateDto) {
    return this.templateService.create(createDto);
  }

  @Get()
  @RequirePermissions('notification-template.view')
  findAll(@Query() filterDto: FilterTemplateDto) {
    return this.templateService.findAll(filterDto);
  }

  @Get('code/:code')
  @RequirePermissions('notification-template.view')
  findByCode(@Param('code') code: string) {
    return this.templateService.findByCode(code);
  }

  @Get(':id')
  @RequirePermissions('notification-template.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.templateService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions('notification-template.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateTemplateDto) {
    return this.templateService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('notification-template.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.templateService.delete(id);
  }
}

