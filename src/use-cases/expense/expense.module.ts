import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IExpenseRepository } from '../../core/repositories/i-expense.repository';
import { PrismaExpenseRepository } from '../../infrastructure/repositories/prisma-expense.repository';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [ExpenseController],
  providers: [
    ExpenseService,
    PrismaService,
    { provide: IExpenseRepository, useClass: PrismaExpenseRepository },
    { provide: IUserRepository, useClass: PrismaUserRepository },
  ],
})
export class ExpenseModule {}

