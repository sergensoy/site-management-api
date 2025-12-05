import { Injectable, Logger } from '@nestjs/common';
import { IStorageService } from '../../../core/interfaces/i-storage.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { Readable } from 'stream';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadsDir: string;

  constructor() {
    // Environment variable'dan al, yoksa default
    this.uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      this.logger.log(`Uploads directory created: ${this.uploadsDir}`);
    }
  }

  /**
   * Tarih bazlı klasör yapısı oluşturur: YYYY/MM/DD
   */
  private getDateBasedPath(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return path.join(String(year), month, day);
  }

  /**
   * Dosya yolu oluşturur ve gerekli klasörleri oluşturur
   */
  private async createFilePath(filename: string, customPath?: string): Promise<string> {
    const datePath = customPath || this.getDateBasedPath();
    const fullPath = path.join(this.uploadsDir, datePath);
    
    // Klasör yoksa oluştur
    await fs.mkdir(fullPath, { recursive: true });
    
    return path.join(datePath, filename);
  }

  async saveFile(
    file: Buffer | NodeJS.ReadableStream,
    filename: string,
    customPath?: string,
  ): Promise<string> {
    const relativePath = await this.createFilePath(filename, customPath);
    const fullPath = path.join(this.uploadsDir, relativePath);

    try {
      if (Buffer.isBuffer(file)) {
        await fs.writeFile(fullPath, file);
      } else {
        // Stream'i dosyaya yaz
        const writeStream = createWriteStream(fullPath);
        file.pipe(writeStream);
        
        await new Promise<void>((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });
      }

      this.logger.debug(`File saved: ${relativePath}`);
      return relativePath;
    } catch (error) {
      this.logger.error(`Error saving file: ${error.message}`, error.stack);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  async readFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadsDir, filePath);
    
    try {
      return await fs.readFile(fullPath);
    } catch (error) {
      this.logger.error(`Error reading file: ${error.message}`, error.stack);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadsDir, filePath);
    
    try {
      await fs.unlink(fullPath);
      this.logger.debug(`File deleted: ${filePath}`);
    } catch (error) {
      // Dosya yoksa hata verme
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error(`Error deleting file: ${error.message}`, error.stack);
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.uploadsDir, filePath);
    
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  getFileStream(filePath: string): NodeJS.ReadableStream {
    const fullPath = path.join(this.uploadsDir, filePath);
    
    try {
      return createReadStream(fullPath);
    } catch (error) {
      this.logger.error(`Error creating file stream: ${error.message}`, error.stack);
      throw new Error(`Failed to create file stream: ${error.message}`);
    }
  }
}

