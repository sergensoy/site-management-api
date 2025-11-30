import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from 'src/infrastructure/common/decorators/define-resource.decorator';

@Controller('sites')
@DefineResource('site', 'Site ve Blok')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  @RequirePermissions('site.create')
  create(@Body() createSiteDto: CreateSiteDto, @Request() req: any) {
    return this.siteService.create(createSiteDto, req.user.id);
  }

  @Get()
  @RequirePermissions('site.view')
  findAll() {
    return this.siteService.findAll();
  }

  @Get(':id')
  @RequirePermissions('site.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.siteService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('site.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSiteDto: UpdateSiteDto, @Request() req: any) {
    return this.siteService.update(id, updateSiteDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('site.delete')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.siteService.remove(id, req.user.id);
  }
}