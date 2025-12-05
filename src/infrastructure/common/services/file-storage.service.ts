import { Injectable, Inject, Logger } from '@nestjs/common';
import { IStorageService } from '../../../core/interfaces/i-storage.service';
import { StorageType } from '../../../core/entities/storage-type.enum';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private storageServices: Map<StorageType, IStorageService>;

  constructor(
    private readonly localStorageService: LocalStorageService,
  ) {
    this.storageServices = new Map();
    this.storageServices.set(StorageType.LOCAL, this.localStorageService);
    // İleride S3 ve Azure storage service'leri eklenecek
  }

  /**
   * Storage type'a göre uygun storage service'i döndürür
   */
  getStorageService(storageType: StorageType = StorageType.LOCAL): IStorageService {
    const service = this.storageServices.get(storageType);
    
    if (!service) {
      this.logger.warn(`Storage service not found for type: ${storageType}, using LOCAL`);
      return this.localStorageService;
    }
    
    return service;
  }

  /**
   * Dosyayı kaydeder (default: LOCAL storage)
   */
  async saveFile(
    file: Buffer | NodeJS.ReadableStream,
    filename: string,
    path?: string,
    storageType: StorageType = StorageType.LOCAL,
  ): Promise<string> {
    const service = this.getStorageService(storageType);
    return service.saveFile(file, filename, path);
  }

  /**
   * Dosyayı okur
   */
  async readFile(filePath: string, storageType: StorageType = StorageType.LOCAL): Promise<Buffer> {
    const service = this.getStorageService(storageType);
    return service.readFile(filePath);
  }

  /**
   * Dosyayı siler
   */
  async deleteFile(filePath: string, storageType: StorageType = StorageType.LOCAL): Promise<void> {
    const service = this.getStorageService(storageType);
    return service.deleteFile(filePath);
  }

  /**
   * Dosyanın var olup olmadığını kontrol eder
   */
  async fileExists(filePath: string, storageType: StorageType = StorageType.LOCAL): Promise<boolean> {
    const service = this.getStorageService(storageType);
    return service.fileExists(filePath);
  }

  /**
   * Dosya stream'i döndürür
   */
  getFileStream(filePath: string, storageType: StorageType = StorageType.LOCAL): NodeJS.ReadableStream {
    const service = this.getStorageService(storageType);
    return service.getFileStream(filePath);
  }
}

