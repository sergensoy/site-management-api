import { Controller, Get, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { FilterNotificationDto } from './dto/filter-notification.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('notifications')
@DefineResource('notification', 'Bildirimler')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @RequirePermissions('notification.view')
  findAll(@Query() filterDto: FilterNotificationDto) {
    return this.notificationService.findAll(filterDto);
  }

  @Get('me')
  @RequirePermissions('notification.view')
  findMyNotifications(@Query() filterDto: FilterNotificationDto) {
    // req.user.id eklenebilir
    return this.notificationService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('notification.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.findById(id);
  }
}

