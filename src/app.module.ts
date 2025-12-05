import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
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
import { NotificationModule } from './use-cases/notification/notification.module';
import { NotificationTemplateModule } from './use-cases/notification-template/notification-template.module';
import { NotificationPreferenceModule } from './use-cases/notification-preference/notification-preference.module';
import { NotificationListenerModule } from './infrastructure/common/listeners/notification-listener.module';
import { NotificationQueueService } from './infrastructure/common/services/notification-queue.service';
import { FileModule } from './use-cases/file/file.module';
import { AnnouncementModule } from './use-cases/announcement/announcement.module';

@Module({
  imports: [
    DiscoveryModule,
    EventEmitterModule.forRoot(),
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
    NotificationModule,
    NotificationTemplateModule,
    NotificationPreferenceModule,
    NotificationListenerModule,
    FileModule,
    AnnouncementModule,
  ],
  controllers: [],
  providers: [
    PermissionScannerService,
    PermissionInitService,
    NotificationQueueService,
  ],
})
export class AppModule {}
