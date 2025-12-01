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
import { DebtService } from './debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { FilterDebtDto } from './dto/filter-debt.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('debts')
@DefineResource('debt', 'Borç')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Post()
  @RequirePermissions('debt.create')
  create(@Body() createDebtDto: CreateDebtDto) {
    return this.debtService.create(createDebtDto);
  }

  @Get()
  @RequirePermissions('debt.view')
  findAll(@Query() filterDto: FilterDebtDto) {
    return this.debtService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('debt.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.debtService.findOne(id);
  }

  @Get('unit/:unitId')
  @RequirePermissions('debt.view')
  findByUnit(@Param('unitId', ParseIntPipe) unitId: number) {
    return this.debtService.findByUnit(unitId);
  }

  @Get('user/:userId')
  @RequirePermissions('debt.view')
  findByPayer(@Param('userId', ParseIntPipe) userId: number) {
    return this.debtService.findByPayer(userId);
  }

  @Get('overdue/all')
  @RequirePermissions('debt.view')
  getOverdue() {
    return this.debtService.getOverdue();
  }

  @Patch(':id')
  @RequirePermissions('debt.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDebtDto: UpdateDebtDto,
  ) {
    return this.debtService.update(id, updateDebtDto);
  }

  @Patch(':id/mark-paid')
  @RequirePermissions('debt.update')
  markAsPaid(@Param('id', ParseIntPipe) id: number) {
    return this.debtService.markAsPaid(id);
  }

  @Delete(':id')
  @RequirePermissions('debt.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.debtService.remove(id);
  }
}

