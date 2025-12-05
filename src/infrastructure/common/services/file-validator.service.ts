import { Injectable, BadRequestException } from '@nestjs/common';
import * as mimeTypes from 'mime-types';

export interface FileValidationOptions {
  maxSize?: number; // bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

@Injectable()
export class FileValidatorService {
  private readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly DEFAULT_ALLOWED_MIME_TYPES = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    // Text
    'text/plain',
    'text/csv',
  ];

  private readonly DEFAULT_ALLOWED_EXTENSIONS = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx',
    'jpg', 'jpeg', 'png', 'gif', 'webp',
    'zip', 'rar',
    'txt', 'csv',
  ];

  validateFile(
    file: Express.Multer.File,
    options: FileValidationOptions = {},
  ): void {
    const maxSize = options.maxSize ?? this.DEFAULT_MAX_SIZE;
    const allowedMimeTypes = options.allowedMimeTypes ?? this.DEFAULT_ALLOWED_MIME_TYPES;
    const allowedExtensions = options.allowedExtensions ?? this.DEFAULT_ALLOWED_EXTENSIONS;

    // Boyut kontrolü
    if (file.size > maxSize) {
      throw new BadRequestException(
        `Dosya boyutu çok büyük. Maksimum boyut: ${this.formatFileSize(maxSize)}`,
      );
    }

    // MIME type kontrolü
    const mimeType = file.mimetype || mimeTypes.lookup(file.originalname) || '';
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        `Dosya tipi desteklenmiyor. İzin verilen tipler: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // Extension kontrolü
    const extension = this.getFileExtension(file.originalname);
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      throw new BadRequestException(
        `Dosya uzantısı desteklenmiyor. İzin verilen uzantılar: ${allowedExtensions.join(', ')}`,
      );
    }
  }

  getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  getMimeType(filename: string): string {
    return mimeTypes.lookup(filename) || 'application/octet-stream';
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

