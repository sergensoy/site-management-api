import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { BlockService } from './block.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('blocks')
@DefineResource('block', 'Blok') // Otomatik izinler: block.view, block.create...
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post()
  @RequirePermissions('block.create')
  create(@Body() createBlockDto: CreateBlockDto, @Request() req: any) {
    return this.blockService.create(createBlockDto, req.user.id);
  }

  @Get('site/:siteId') // Bir siteye ait blokları getir
  @RequirePermissions('block.view')
  findAllBySite(@Param('siteId', ParseIntPipe) siteId: number) {
    return this.blockService.findAllBySite(siteId);
  }

  @Get(':id')
  @RequirePermissions('block.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blockService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('block.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBlockDto: UpdateBlockDto, @Request() req: any) {
    return this.blockService.update(id, updateBlockDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('block.delete')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.blockService.remove(id, req.user.id);
  }
}