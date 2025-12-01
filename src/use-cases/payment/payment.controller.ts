import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FilterPaymentDto } from './dto/filter-payment.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('payments')
@DefineResource('payment', 'Ödeme')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @RequirePermissions('payment.create')
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req: any) {
    return this.paymentService.create(createPaymentDto, req.user.id);
  }

  @Get()
  @RequirePermissions('payment.view')
  findAll(@Query() filterDto: FilterPaymentDto) {
    return this.paymentService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('payment.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  @Get('debt/:debtId')
  @RequirePermissions('payment.view')
  findByDebt(@Param('debtId', ParseIntPipe) debtId: number) {
    return this.paymentService.findByDebt(debtId);
  }

  @Get('debt/:debtId/remaining')
  @RequirePermissions('payment.view')
  getDebtRemaining(@Param('debtId', ParseIntPipe) debtId: number) {
    return this.paymentService.getDebtRemaining(debtId);
  }

  @Patch(':id/cancel')
  @RequirePermissions('payment.update')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.cancel(id);
  }
}

