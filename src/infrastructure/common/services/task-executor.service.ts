import { Injectable, Inject, Logger } from '@nestjs/common';
import { ITaskExecutionRepository } from '../../../core/repositories/i-task-execution.repository';
import { IScheduledTaskRepository } from '../../../core/repositories/i-scheduled-task.repository';
import { ScheduledTask, TaskStatus } from '../../../core/entities/scheduled-task.entity';
import { TaskExecution, ExecutionStatus } from '../../../core/entities/task-execution.entity';
import { TaskHandlerRegistry } from './task-handler-registry.service';
import { ITaskHandler, TaskContext, TaskResult } from '../../../core/interfaces/i-task-handler';

@Injectable()
export class TaskExecutorService {
  private readonly logger = new Logger(TaskExecutorService.name);

  constructor(
    private handlerRegistry: TaskHandlerRegistry,
    @Inject(ITaskExecutionRepository) private executionRepository: ITaskExecutionRepository,
    @Inject(IScheduledTaskRepository) private taskRepository: IScheduledTaskRepository,
  ) {}

  async executeTask(task: ScheduledTask): Promise<void> {
    // Handler'ı bul
    const handler = this.handlerRegistry.get(task.handlerName);
    if (!handler) {
      this.logger.error(`Handler not found: ${task.handlerName}`);
      await this.createFailedExecution(
        task.id,
        `Handler not found: ${task.handlerName}`,
      );
      return;
    }

    // Execution kaydı oluştur
    const execution = await this.createExecution(task);

    try {
      // Payload validation (eğer handler'da validate metodu varsa)
      if (handler.validate && !handler.validate(task.payload)) {
        throw new Error('Payload validation failed');
      }

      // Task context oluştur
      const context: TaskContext = {
        taskId: task.id,
        executionId: execution.id,
        startedAt: execution.startedAt,
        retryCount: execution.retryCount,
      };

      // Handler'ı çalıştır
      const result = await handler.execute(task.payload || {}, context);

      // Başarılı sonucu kaydet
      await this.saveSuccess(execution, result);

      this.logger.log(`Task ${task.id} (${task.name}) başarıyla çalıştırıldı`);
    } catch (error: any) {
      this.logger.error(`Task ${task.id} (${task.name}) çalıştırılırken hata:`, error);

      // Hata durumunda retry logic
      await this.handleError(execution, error, task);

      // Handler'ın onError metodu varsa çağır
      if (handler.onError) {
        try {
          await handler.onError(error, {
            taskId: task.id,
            executionId: execution.id,
            startedAt: execution.startedAt,
            retryCount: execution.retryCount,
          });
        } catch (onErrorError) {
          this.logger.error('Handler onError metodu hata verdi:', onErrorError);
        }
      }
    }
  }

  private async createExecution(task: ScheduledTask): Promise<TaskExecution> {
    const execution = new TaskExecution({
      taskId: task.id,
      status: ExecutionStatus.RUNNING,
      startedAt: new Date(),
      retryCount: 0,
    });

    return this.executionRepository.create(execution);
  }

  private async saveSuccess(execution: TaskExecution, result: TaskResult): Promise<void> {
    const completedAt = new Date();
    const duration = completedAt.getTime() - execution.startedAt.getTime();

    await this.executionRepository.update(execution.id, {
      status: ExecutionStatus.SUCCESS,
      completedAt,
      duration,
      result: result.data || result,
    });
  }

  private async handleError(
    execution: TaskExecution,
    error: Error,
    task: ScheduledTask,
  ): Promise<void> {
    const completedAt = new Date();
    const duration = completedAt.getTime() - execution.startedAt.getTime();
    const errorMessage = error.message || String(error);

    // Execution'ı failed olarak işaretle
    await this.executionRepository.update(execution.id, {
      status: ExecutionStatus.FAILED,
      completedAt,
      duration,
      error: errorMessage,
    });

    // Retry logic
    if (execution.retryCount < task.maxRetries) {
      this.logger.log(
        `Task ${task.id} retry edilecek (${execution.retryCount + 1}/${task.maxRetries})`,
      );

      // Retry için yeni execution oluştur
      const retryExecution = new TaskExecution({
        taskId: task.id,
        status: ExecutionStatus.RUNNING,
        startedAt: new Date(),
        retryCount: execution.retryCount + 1,
      });

      await this.executionRepository.create(retryExecution);

      // Retry delay sonrası tekrar çalıştır (async, non-blocking)
      setTimeout(async () => {
        try {
          await this.executeTask(task);
        } catch (retryError) {
          this.logger.error(`Task ${task.id} retry başarısız:`, retryError);
        }
      }, task.retryDelay * 1000);
    } else {
      this.logger.error(
        `Task ${task.id} maksimum retry sayısına ulaştı, task durduruldu`,
      );

      // Task'ı failed olarak işaretle
      await this.taskRepository.update(task.id, {
        status: TaskStatus.FAILED,
      });
    }
  }

  private async createFailedExecution(taskId: number, error: string): Promise<void> {
    const execution = new TaskExecution({
      taskId,
      status: ExecutionStatus.FAILED,
      startedAt: new Date(),
      completedAt: new Date(),
      error,
      retryCount: 0,
    });

    await this.executionRepository.create(execution);
  }
}

