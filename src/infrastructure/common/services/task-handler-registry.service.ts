import { Injectable, Logger, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ITaskHandler } from '../../../core/interfaces/i-task-handler';
import { TASK_HANDLER_KEY, TaskHandlerMetadata } from '../decorators/task-handler.decorator';

@Injectable()
export class TaskHandlerRegistry {
  private readonly logger = new Logger(TaskHandlerRegistry.name);
  private handlers = new Map<string, ITaskHandler>();
  private handlerClasses = new Map<string, Type<ITaskHandler>>();

  constructor(private moduleRef: ModuleRef) {}

  /**
   * Handler'ı kaydet (class instance olarak)
   */
  register(name: string, handler: ITaskHandler): void {
    if (this.handlers.has(name)) {
      this.logger.warn(`Handler '${name}' zaten kayıtlı, üzerine yazılıyor.`);
    }
    this.handlers.set(name, handler);
    this.logger.log(`Handler kaydedildi: ${name}`);
  }

  /**
   * Handler class'ını kaydet (lazy loading için)
   */
  registerClass(name: string, handlerClass: Type<ITaskHandler>): void {
    this.handlerClasses.set(name, handlerClass);
  }

  /**
   * Handler'ı bul ve instance'ını döndür
   */
  get(name: string): ITaskHandler | null {
    // Önce instance map'ten bak
    if (this.handlers.has(name)) {
      return this.handlers.get(name)!;
    }

    // Yoksa class'tan instance oluştur
    if (this.handlerClasses.has(name)) {
      const handlerClass = this.handlerClasses.get(name)!;
      try {
        const instance = this.moduleRef.get(handlerClass, { strict: false });
        if (instance) {
          this.handlers.set(name, instance);
          return instance;
        }
      } catch (error) {
        this.logger.error(`Handler instance oluşturulamadı: ${name}`, error);
      }
    }

    return null;
  }

  /**
   * Handler var mı kontrol et
   */
  has(name: string): boolean {
    return this.handlers.has(name) || this.handlerClasses.has(name);
  }

  /**
   * Tüm handler'ları listele
   */
  getAll(): ITaskHandler[] {
    const allHandlers: ITaskHandler[] = [];
    
    // Instance'lardan
    this.handlers.forEach(handler => allHandlers.push(handler));
    
    // Class'lardan lazy load
    this.handlerClasses.forEach((handlerClass, name) => {
      if (!this.handlers.has(name)) {
        const handler = this.get(name);
        if (handler) {
          allHandlers.push(handler);
        }
      }
    });
    
    return allHandlers;
  }

  /**
   * Handler metadata'larını al
   */
  getMetadata(handler: ITaskHandler): TaskHandlerMetadata | null {
    const handlerClass = handler.constructor as Type<ITaskHandler>;
    const metadata = Reflect.getMetadata(TASK_HANDLER_KEY, handlerClass);
    return metadata || null;
  }

  /**
   * Tüm handler isimlerini listele
   */
  getAllNames(): string[] {
    const names = new Set<string>();
    this.handlers.forEach((_, name) => names.add(name));
    this.handlerClasses.forEach((_, name) => names.add(name));
    return Array.from(names);
  }
}

