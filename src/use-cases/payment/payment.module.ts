import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IPaymentRepository } from '../../core/repositories/i-payment.repository';
import { PrismaPaymentRepository } from '../../infrastructure/repositories/prisma-payment.repository';
import { IDebtRepository } from '../../core/repositories/i-debt.repository';
import { PrismaDebtRepository } from '../../infrastructure/repositories/prisma-debt.repository';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PrismaService,
    { provide: IPaymentRepository, useClass: PrismaPaymentRepository },
    { provide: IDebtRepository, useClass: PrismaDebtRepository },
    { provide: IUserRepository, useClass: PrismaUserRepository },
  ],
})
export class PaymentModule {}

