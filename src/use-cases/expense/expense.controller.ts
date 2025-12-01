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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('expenses')
@DefineResource('expense', 'Gider')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @RequirePermissions('expense.create')
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req: any) {
    return this.expenseService.create(createExpenseDto, req.user.id);
  }

  @Get()
  @RequirePermissions('expense.view')
  findAll(@Query() filterDto: FilterExpenseDto) {
    return this.expenseService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('expense.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expenseService.findOne(id);
  }

  @Get('site/:siteId')
  @RequirePermissions('expense.view')
  findBySite(@Param('siteId', ParseIntPipe) siteId: number) {
    return this.expenseService.findBySite(siteId);
  }

  @Patch(':id')
  @RequirePermissions('expense.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() req: any,
  ) {
    return this.expenseService.update(id, updateExpenseDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('expense.delete')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.expenseService.remove(id, req.user.id);
  }

  @Patch(':id/cancel')
  @RequirePermissions('expense.update')
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.expenseService.cancel(id, req.user.id);
  }
}

