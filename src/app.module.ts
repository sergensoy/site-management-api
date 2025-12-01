import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { PermissionScannerService } from './infrastructure/common/services/permission-scanner.service';
import { AuthModule } from './use-cases/auth/auth.module';
import { RoleModule } from './use-cases/role/role.module';
import { SiteModule } from './use-cases/site/site.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { PermissionInitService } from './infrastructure/common/services/permission-init.service';
import { BlockModule } from './use-cases/block/block.module';
import { UnitModule } from './use-cases/unit/unit.module';
import { UserModule } from './use-cases/user/user.module';
import { ExpenseModule } from './use-cases/expense/expense.module';
import { DebtModule } from './use-cases/debt/debt.module';
import { PaymentModule } from './use-cases/payment/payment.module';
import { ResidencyModule } from './use-cases/residency/residency.module';
import { ScheduledTaskModule } from './use-cases/scheduled-task/scheduled-task.module';
import { TaskHandlersModule } from './task-handlers/task-handlers.module';

@Module({
  imports: [
    DiscoveryModule,
    AuthModule,
    RoleModule,
    SiteModule,
    PrismaModule,
    BlockModule,
    UnitModule,
    UserModule,
    ExpenseModule,
    DebtModule,
    PaymentModule,
    ResidencyModule,
    TaskHandlersModule,
    ScheduledTaskModule,
  ],
  controllers: [],
  providers: [
    PermissionScannerService,
    PermissionInitService,
  ],
})
export class AppModule {}
