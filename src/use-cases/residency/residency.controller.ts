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
import { ResidencyService } from './residency.service';
import { CreateResidencyDto } from './dto/create-residency.dto';
import { UpdateResidencyDto } from './dto/update-residency.dto';
import { MoveOutDto } from './dto/move-out.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('residencies')
@DefineResource('residency', 'İkamet')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ResidencyController {
  constructor(private readonly residencyService: ResidencyService) {}

  @Post()
  @RequirePermissions('residency.create')
  create(@Body() createResidencyDto: CreateResidencyDto) {
    return this.residencyService.create(createResidencyDto);
  }

  @Get()
  @RequirePermissions('residency.view')
  findAll() {
    return this.residencyService.findAll();
  }

  @Get(':id')
  @RequirePermissions('residency.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.residencyService.findOne(id);
  }

  @Get('unit/:unitId')
  @RequirePermissions('residency.view')
  findByUnit(@Param('unitId', ParseIntPipe) unitId: number) {
    return this.residencyService.findByUnit(unitId);
  }

  @Get('user/:userId')
  @RequirePermissions('residency.view')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.residencyService.findByUser(userId);
  }

  @Patch(':id')
  @RequirePermissions('residency.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResidencyDto: UpdateResidencyDto,
  ) {
    return this.residencyService.update(id, updateResidencyDto);
  }

  @Patch(':id/move-out')
  @RequirePermissions('residency.update')
  moveOut(@Param('id', ParseIntPipe) id: number, @Body() moveOutDto: MoveOutDto) {
    return this.residencyService.moveOut(id, moveOutDto);
  }

  @Delete(':id')
  @RequirePermissions('residency.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.residencyService.remove(id);
  }
}

