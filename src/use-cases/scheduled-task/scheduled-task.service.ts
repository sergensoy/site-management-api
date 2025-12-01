import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IScheduledTaskRepository } from '../../core/repositories/i-scheduled-task.repository';
import { ITaskExecutionRepository } from '../../core/repositories/i-task-execution.repository';
import { ScheduledTask, TaskStatus } from '../../core/entities/scheduled-task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { TaskExecutorService } from '../../infrastructure/common/services/task-executor.service';
import { TaskSchedulerService } from '../../infrastructure/common/services/task-scheduler.service';
import { TaskHandlerRegistry } from '../../infrastructure/common/services/task-handler-registry.service';
import { CronValidatorService } from '../../infrastructure/common/services/cron-validator.service';

@Injectable()
export class ScheduledTaskService {
  constructor(
    @Inject(IScheduledTaskRepository) private taskRepository: IScheduledTaskRepository,
    @Inject(ITaskExecutionRepository) private executionRepository: ITaskExecutionRepository,
    private taskExecutor: TaskExecutorService,
    private taskScheduler: TaskSchedulerService,
    private handlerRegistry: TaskHandlerRegistry,
    private cronValidator: CronValidatorService,
  ) {}

  async create(dto: CreateTaskDto, userId: number): Promise<ScheduledTask> {
    // Handler var mı kontrol et
    if (!this.handlerRegistry.has(dto.handlerName)) {
      throw new BadRequestException(`Handler bulunamadı: ${dto.handlerName}`);
    }

    // Schedule validation
    this.validateSchedule(dto);

    const newTask = new ScheduledTask({
      ...dto,
      status: TaskStatus.ACTIVE,
      maxRetries: dto.maxRetries ?? 3,
      retryDelay: dto.retryDelay ?? 60,
    });

    const created = await this.taskRepository.create(newTask);

    // Task'ı schedule et
    await this.taskScheduler.scheduleTask(created);

    return created;
  }

  async findAll(filterDto: FilterTaskDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    let tasks = await this.taskRepository.findAll();

    // Filtreleme
    if (filterDto.status) {
      tasks = tasks.filter(t => t.status === filterDto.status);
    }
    if (filterDto.handlerName) {
      tasks = tasks.filter(t => t.handlerName === filterDto.handlerName);
    }
    if (filterDto.search) {
      const searchLower = filterDto.search.toLowerCase();
      tasks = tasks.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    const total = tasks.length;
    const paginatedTasks = tasks.slice(skip, skip + limit);

    return {
      data: paginatedTasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ScheduledTask> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task bulunamadı.');
    }
    return task;
  }

  async update(id: number, dto: UpdateTaskDto, userId: number): Promise<ScheduledTask> {
    const task = await this.findOne(id);

    // Handler değişikliği kontrolü
    if (dto.handlerName && dto.handlerName !== task.handlerName) {
      if (!this.handlerRegistry.has(dto.handlerName)) {
        throw new BadRequestException(`Handler bulunamadı: ${dto.handlerName}`);
      }
    }

    // Schedule validation
    if (dto.scheduleType || dto.cronExpression || dto.intervalValue) {
      this.validateSchedule({
        scheduleType: dto.scheduleType || task.scheduleType,
        cronExpression: dto.cronExpression || task.cronExpression || undefined,
        intervalValue: dto.intervalValue || task.intervalValue || undefined,
      } as any);
    }

    const updated = await this.taskRepository.update(id, dto);

    // Eğer status değiştiyse veya schedule değiştiyse, yeniden schedule et
    if (dto.status || dto.scheduleType || dto.cronExpression || dto.intervalValue) {
      if (updated.status === TaskStatus.ACTIVE) {
        await this.taskScheduler.scheduleTask(updated);
      } else {
        this.taskScheduler.unscheduleTask(updated.id);
      }
    }

    return updated;
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id);
    
    // Schedule'dan kaldır
    this.taskScheduler.unscheduleTask(id);
    
    // Soft delete
    return this.taskRepository.delete(id);
  }

  async execute(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.taskExecutor.executeTask(task);
  }

  async pause(id: number, userId: number): Promise<ScheduledTask> {
    const task = await this.findOne(id);
    
    // Schedule'dan kaldır
    this.taskScheduler.unscheduleTask(id);
    
    return this.taskRepository.update(id, {
      status: TaskStatus.PAUSED,
    });
  }

  async resume(id: number, userId: number): Promise<ScheduledTask> {
    const task = await this.findOne(id);
    
    const updated = await this.taskRepository.update(id, {
      status: TaskStatus.ACTIVE,
    });
    
    // Yeniden schedule et
    await this.taskScheduler.scheduleTask(updated);
    
    return updated;
  }

  async getExecutions(taskId: number, page: number = 1, limit: number = 10) {
    const executions = await this.executionRepository.findByTaskId(taskId);
    const skip = (page - 1) * limit;
    const total = executions.length;
    const paginated = executions.slice(skip, skip + limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAvailableHandlers() {
    const handlers = this.handlerRegistry.getAll();
    return handlers.map(handler => {
      const metadata = this.handlerRegistry.getMetadata(handler);
      return {
        name: handler.name,
        description: handler.description,
        category: metadata?.category,
      };
    });
  }

  private validateSchedule(dto: { scheduleType: string; cronExpression?: string; intervalValue?: number; startDate?: Date }): void {
    if (dto.scheduleType === 'CRON') {
      if (!dto.cronExpression) {
        throw new BadRequestException('CRON schedule type için cronExpression gereklidir');
      }
      const validation = this.cronValidator.validateCronExpression(dto.cronExpression);
      if (!validation.valid) {
        throw new BadRequestException(`Geçersiz cron expression: ${validation.error}`);
      }
    }
    if (dto.scheduleType === 'INTERVAL') {
      if (!dto.intervalValue) {
        throw new BadRequestException('INTERVAL schedule type için intervalValue gereklidir');
      }
      if (dto.intervalValue < 1) {
        throw new BadRequestException('intervalValue en az 1 saniye olmalıdır');
      }
    }
    if (dto.scheduleType === 'ONCE') {
      if (!dto.startDate) {
        throw new BadRequestException('ONCE schedule type için startDate gereklidir');
      }
    }
  }
}

