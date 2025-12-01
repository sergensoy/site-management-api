import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ScheduledTaskService } from './scheduled-task.service';
import { ScheduledTaskController } from './scheduled-task.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IScheduledTaskRepository } from '../../core/repositories/i-scheduled-task.repository';
import { PrismaScheduledTaskRepository } from '../../infrastructure/repositories/prisma-scheduled-task.repository';
import { ITaskExecutionRepository } from '../../core/repositories/i-task-execution.repository';
import { PrismaTaskExecutionRepository } from '../../infrastructure/repositories/prisma-task-execution.repository';
import { TaskExecutorService } from '../../infrastructure/common/services/task-executor.service';
import { TaskSchedulerService } from '../../infrastructure/common/services/task-scheduler.service';
import { TaskHandlerRegistry } from '../../infrastructure/common/services/task-handler-registry.service';
import { TaskHandlerDiscoveryService } from '../../infrastructure/common/services/task-handler-discovery.service';
import { CronValidatorService } from '../../infrastructure/common/services/cron-validator.service';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  imports: [DiscoveryModule],
  controllers: [ScheduledTaskController],
  providers: [
    ScheduledTaskService,
    PrismaService,
    { provide: IScheduledTaskRepository, useClass: PrismaScheduledTaskRepository },
    { provide: ITaskExecutionRepository, useClass: PrismaTaskExecutionRepository },
    { provide: IUserRepository, useClass: PrismaUserRepository },
    TaskExecutorService,
    TaskSchedulerService,
    TaskHandlerRegistry,
    TaskHandlerDiscoveryService,
    CronValidatorService,
  ],
  exports: [ScheduledTaskService, TaskHandlerRegistry],
})
export class ScheduledTaskModule {}

