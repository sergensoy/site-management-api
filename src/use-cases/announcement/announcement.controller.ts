import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { FilterAnnouncementDto } from './dto/filter-announcement.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileService } from '../file/file.service';

@ApiTags('Announcements')
@Controller('announcements')
@DefineResource('announcement', 'Duyuru')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AnnouncementController {
  constructor(
    private readonly announcementService: AnnouncementService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  @RequirePermissions('announcement.create')
  @ApiOperation({ summary: 'Duyuru oluştur' })
  create(@Body() createDto: CreateAnnouncementDto, @Request() req: any) {
    return this.announcementService.create(createDto, req.user.id);
  }

  @Get()
  @RequirePermissions('announcement.view')
  @ApiOperation({ summary: 'Duyuru listesi (filtreleme destekli)' })
  findAll(@Query() filterDto: FilterAnnouncementDto) {
    return this.announcementService.findAll(filterDto);
  }

  @Get('my')
  @RequirePermissions('announcement.view')
  @ApiOperation({ summary: 'Kullanıcının görebileceği duyurular' })
  @ApiQuery({ name: 'siteId', required: false, type: Number })
  @ApiQuery({ name: 'unitIds', required: false, type: [Number] })
  findMy(
    @Request() req: any,
    @Query('siteId', new ParseIntPipe({ optional: true })) siteId?: number,
    @Query('unitIds') unitIds?: string,
  ) {
    const parsedUnitIds = unitIds ? unitIds.split(',').map(id => parseInt(id, 10)) : undefined;
    return this.announcementService.findForUser(req.user.id, siteId, parsedUnitIds);
  }

  @Get('unread')
  @RequirePermissions('announcement.view')
  @ApiOperation({ summary: 'Okunmamış duyurular' })
  @ApiQuery({ name: 'siteId', required: false, type: Number })
  @ApiQuery({ name: 'unitIds', required: false, type: [Number] })
  findUnread(
    @Request() req: any,
    @Query('siteId', new ParseIntPipe({ optional: true })) siteId?: number,
    @Query('unitIds') unitIds?: string,
  ) {
    const parsedUnitIds = unitIds ? unitIds.split(',').map(id => parseInt(id, 10)) : undefined;
    return this.announcementService.findUnread(req.user.id, siteId, parsedUnitIds);
  }

  @Get(':id')
  @RequirePermissions('announcement.view')
  @ApiOperation({ summary: 'Duyuru detayı' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcementService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('announcement.update')
  @ApiOperation({ summary: 'Duyuru güncelle' })
  @ApiParam({ name: 'id', type: 'number' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAnnouncementDto,
    @Request() req: any,
  ) {
    return this.announcementService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('announcement.delete')
  @ApiOperation({ summary: 'Duyuru sil' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.announcementService.remove(id, req.user.id);
  }

  @Patch(':id/publish')
  @RequirePermissions('announcement.update')
  @ApiOperation({ summary: 'Duyuruyu yayınla' })
  @ApiParam({ name: 'id', type: 'number' })
  publish(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.announcementService.publish(id, req.user.id);
  }

  @Patch(':id/archive')
  @RequirePermissions('announcement.update')
  @ApiOperation({ summary: 'Duyuruyu arşivle' })
  @ApiParam({ name: 'id', type: 'number' })
  archive(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.announcementService.archive(id, req.user.id);
  }

  @Patch(':id/pin')
  @RequirePermissions('announcement.update')
  @ApiOperation({ summary: 'Duyuruyu sabitle/kaldır' })
  @ApiParam({ name: 'id', type: 'number' })
  togglePin(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.announcementService.togglePin(id, req.user.id);
  }

  @Get(':id/readers')
  @RequirePermissions('announcement.view')
  @ApiOperation({ summary: 'Duyuruyu okuyan kullanıcılar' })
  @ApiParam({ name: 'id', type: 'number' })
  getReaders(@Param('id', ParseIntPipe) id: number) {
    return this.announcementService.getReaders(id);
  }

  @Get(':id/statistics')
  @RequirePermissions('announcement.view')
  @ApiOperation({ summary: 'Duyuru istatistikleri' })
  @ApiParam({ name: 'id', type: 'number' })
  getStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.announcementService.getStatistics(id);
  }

  @Post(':id/read')
  @RequirePermissions('announcement.view')
  @ApiOperation({ summary: 'Duyuruyu okundu olarak işaretle' })
  @ApiParam({ name: 'id', type: 'number' })
  markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.announcementService.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  @RequirePermissions('announcement.view')
  @ApiOperation({ summary: 'Tüm duyuruları okundu olarak işaretle' })
  @ApiQuery({ name: 'announcementIds', required: true, type: [Number] })
  markAllAsRead(
    @Request() req: any,
    @Query('announcementIds') announcementIds: string,
  ) {
    const ids = announcementIds.split(',').map(id => parseInt(id, 10));
    return this.announcementService.markAllAsRead(req.user.id, ids);
  }

  @Get(':id/files')
  @RequirePermissions('announcement.view')
  @ApiOperation({ summary: 'Duyuruya bağlı dosyalar' })
  @ApiParam({ name: 'id', type: 'number' })
  getFiles(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.findByEntity('Announcement', id);
  }
}

