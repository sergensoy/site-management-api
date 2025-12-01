import { Module } from '@nestjs/common';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IDebtRepository } from '../../core/repositories/i-debt.repository';
import { PrismaDebtRepository } from '../../infrastructure/repositories/prisma-debt.repository';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [DebtController],
  providers: [
    DebtService,
    PrismaService,
    { provide: IDebtRepository, useClass: PrismaDebtRepository },
    { provide: IUserRepository, useClass: PrismaUserRepository },
  ],
})
export class DebtModule {}

