import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('units')
@DefineResource('unit', 'Daire') // Otomatik izinler: unit.view, unit.create...
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @RequirePermissions('unit.create')
  create(@Body() createUnitDto: CreateUnitDto, @Request() req: any) {
    return this.unitService.create(createUnitDto, req.user.id);
  }

  @Get('block/:blockId') // Bir bloğa ait daireleri getir
  @RequirePermissions('unit.view')
  findAllByBlock(@Param('blockId', ParseIntPipe) blockId: number) {
    return this.unitService.findAllByBlock(blockId);
  }

  @Get(':id')
  @RequirePermissions('unit.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('unit.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUnitDto: UpdateUnitDto, @Request() req: any) {
    return this.unitService.update(id, updateUnitDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('unit.delete')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.unitService.remove(id, req.user.id);
  }
}