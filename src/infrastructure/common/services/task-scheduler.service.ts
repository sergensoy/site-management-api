import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { IScheduledTaskRepository } from '../../../core/repositories/i-scheduled-task.repository';
import { ScheduledTask, ScheduleType, TaskStatus } from '../../../core/entities/scheduled-task.entity';
import { TaskExecutorService } from './task-executor.service';

@Injectable()
export class TaskSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(TaskSchedulerService.name);
  private scheduledJobs = new Map<number, CronJob>();

  constructor(
    @Inject(IScheduledTaskRepository) private taskRepository: IScheduledTaskRepository,
    private taskExecutor: TaskExecutorService,
  ) {}

  async onModuleInit() {
    this.logger.log('Task Scheduler başlatılıyor...');
    await this.loadAndScheduleTasks();
  }

  /**
   * Tüm aktif task'ları yükle ve schedule et
   */
  async loadAndScheduleTasks(): Promise<void> {
    const activeTasks = await this.taskRepository.findActive();
    this.logger.log(`${activeTasks.length} aktif task bulundu`);

    for (const task of activeTasks) {
      await this.scheduleTask(task);
    }
  }

  /**
   * Task'ı schedule et
   */
  async scheduleTask(task: ScheduledTask): Promise<void> {
    // Eğer zaten schedule edilmişse önce kaldır
    if (this.scheduledJobs.has(task.id)) {
      this.unscheduleTask(task.id);
    }

    // Task durumunu kontrol et
    if (task.status !== TaskStatus.ACTIVE) {
      this.logger.warn(`Task ${task.id} aktif değil, schedule edilmedi`);
      return;
    }

    // Start date kontrolü
    if (task.startDate && new Date(task.startDate) > new Date()) {
      this.logger.log(`Task ${task.id} henüz başlamadı, schedule edilmedi`);
      return;
    }

    // End date kontrolü
    if (task.endDate && new Date(task.endDate) < new Date()) {
      this.logger.log(`Task ${task.id} süresi dolmuş, schedule edilmedi`);
      return;
    }

    try {
      let job: CronJob;

      if (task.scheduleType === ScheduleType.CRON && task.cronExpression) {
        // Cron expression ile schedule
        job = new CronJob(
          task.cronExpression,
          async () => {
            await this.executeScheduledTask(task);
          },
          null,
          true,
        );
      } else if (task.scheduleType === ScheduleType.INTERVAL && task.intervalValue) {
        // Interval ile schedule (her X saniyede bir)
        const intervalMs = task.intervalValue * 1000;
        job = new CronJob(
          `*/${task.intervalValue} * * * * *`, // Her X saniyede bir
          async () => {
            await this.executeScheduledTask(task);
          },
          null,
          true,
        );
      } else if (task.scheduleType === ScheduleType.ONCE && task.startDate) {
        // Tek seferlik - startDate'de çalış
        const startDate = new Date(task.startDate);
        const now = new Date();
        const delay = startDate.getTime() - now.getTime();

        if (delay > 0) {
          setTimeout(async () => {
            await this.executeScheduledTask(task);
            // Tek seferlik task'ı completed yap
            await this.taskRepository.update(task.id, {
              status: TaskStatus.COMPLETED,
            });
          }, delay);
        } else {
          // Zaten geçmiş, hemen çalıştır
          await this.executeScheduledTask(task);
          await this.taskRepository.update(task.id, {
            status: TaskStatus.COMPLETED,
          });
        }
        return;
      } else {
        this.logger.error(`Task ${task.id} için geçersiz schedule tipi`);
        return;
      }

      // Job'ı kaydet
      this.scheduledJobs.set(task.id, job);

      this.logger.log(`Task ${task.id} (${task.name}) schedule edildi`);
    } catch (error) {
      this.logger.error(`Task ${task.id} schedule edilirken hata:`, error);
    }
  }

  /**
   * Task'ın schedule'ını kaldır
   */
  unscheduleTask(taskId: number): void {
    if (this.scheduledJobs.has(taskId)) {
      const job = this.scheduledJobs.get(taskId)!;
      job.stop();
      this.scheduledJobs.delete(taskId);

      this.logger.log(`Task ${taskId} schedule'dan kaldırıldı`);
    }
  }

  /**
   * Scheduled task'ı çalıştır
   */
  private async executeScheduledTask(task: ScheduledTask): Promise<void> {
    // End date kontrolü
    if (task.endDate && new Date(task.endDate) < new Date()) {
      this.logger.log(`Task ${task.id} süresi dolmuş, durduruluyor`);
      await this.taskRepository.update(task.id, {
        status: TaskStatus.COMPLETED,
      });
      this.unscheduleTask(task.id);
      return;
    }

    // Task'ı çalıştır
    await this.taskExecutor.executeTask(task);
  }

  /**
   * Tüm schedule'ları yeniden yükle
   */
  async reloadSchedules(): Promise<void> {
    this.logger.log('Tüm schedule\'lar yeniden yükleniyor...');
    
    // Mevcut job'ları temizle
    this.scheduledJobs.forEach((_, taskId) => {
      this.unscheduleTask(taskId);
    });
    this.scheduledJobs.clear();

    // Yeniden yükle
    await this.loadAndScheduleTasks();
  }
}

