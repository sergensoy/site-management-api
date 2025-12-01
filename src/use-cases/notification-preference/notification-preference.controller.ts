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
} from '@nestjs/common';
import { NotificationPreferenceService } from './notification-preference.service';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('notification-preferences')
@DefineResource('notification-preference', 'Bildirim Tercihleri')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class NotificationPreferenceController {
  constructor(private readonly preferenceService: NotificationPreferenceService) {}

  @Post()
  @RequirePermissions('notification-preference.create')
  create(@Body() createDto: CreatePreferenceDto, @Request() req: any) {
    return this.preferenceService.create(createDto, req.user.id);
  }

  @Get('me')
  @RequirePermissions('notification-preference.view')
  findMyPreferences(@Request() req: any) {
    return this.preferenceService.findByUser(req.user.id);
  }

  @Get('user/:userId')
  @RequirePermissions('notification-preference.view')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.preferenceService.findByUser(userId);
  }

  @Patch(':id')
  @RequirePermissions('notification-preference.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePreferenceDto) {
    return this.preferenceService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('notification-preference.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.preferenceService.delete(id);
  }
}

