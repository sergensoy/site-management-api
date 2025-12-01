import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { TaskHandlerRegistry } from './task-handler-registry.service';
import { ITaskHandler } from '../../../core/interfaces/i-task-handler';
import { TASK_HANDLER_KEY } from '../decorators/task-handler.decorator';

@Injectable()
export class TaskHandlerDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(TaskHandlerDiscoveryService.name);

  constructor(
    private discoveryService: DiscoveryService,
    private handlerRegistry: TaskHandlerRegistry,
    private moduleRef: ModuleRef,
  ) {}

  async onModuleInit() {
    this.logger.log('Handler discovery başlatılıyor...');
    await this.discoverHandlers();
  }

  /**
   * Tüm handler'ları keşfet ve kaydet
   */
  async discoverHandlers(): Promise<void> {
    const providers = this.discoveryService.getProviders();

    let discoveredCount = 0;

    for (const provider of providers) {
      const instance = provider.instance;
      if (!instance || typeof instance !== 'object') continue;

      const handlerClass = provider.metatype;
      if (!handlerClass) continue;

      // @TaskHandler decorator'ını kontrol et
      const metadata = Reflect.getMetadata(TASK_HANDLER_KEY, handlerClass);
      if (!metadata) continue;

      // ITaskHandler interface'ini implement ediyor mu kontrol et
      if (!this.isTaskHandler(instance)) {
        this.logger.warn(
          `${handlerClass.name} @TaskHandler ile işaretlenmiş ama ITaskHandler implement etmiyor`,
        );
        continue;
      }

      // Handler'ı kaydet
      const handler = instance as ITaskHandler;
      this.handlerRegistry.register(metadata.name, handler);
      this.handlerRegistry.registerClass(metadata.name, handlerClass as any);

      this.logger.log(
        `Handler keşfedildi: ${metadata.name} (${handlerClass.name})`,
      );
      discoveredCount++;
    }

    this.logger.log(`${discoveredCount} handler keşfedildi ve kaydedildi`);
  }

  /**
   * Instance'ın ITaskHandler olup olmadığını kontrol et
   */
  private isTaskHandler(instance: any): instance is ITaskHandler {
    return (
      typeof instance === 'object' &&
      instance !== null &&
      typeof instance.name === 'string' &&
      typeof instance.description === 'string' &&
      typeof instance.execute === 'function'
    );
  }
}

