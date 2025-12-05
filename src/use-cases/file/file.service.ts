import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { IFileRepository } from '../../core/repositories/i-file.repository';
import { IFileAttachmentRepository } from '../../core/repositories/i-file-attachment.repository';
import { File } from '../../core/entities/file.entity';
import { FileAttachment } from '../../core/entities/file-attachment.entity';
import { FileValidatorService } from '../../infrastructure/common/services/file-validator.service';
import { FileStorageService } from '../../infrastructure/common/services/file-storage.service';
import { FileCategory } from '../../core/entities/file-category.enum';
import { FileStatus } from '../../core/entities/file-status.enum';
import { StorageType } from '../../core/entities/storage-type.enum';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilterFileDto } from './dto/filter-file.dto';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    @Inject(IFileRepository) private fileRepository: IFileRepository,
    @Inject(IFileAttachmentRepository) private fileAttachmentRepository: IFileAttachmentRepository,
    private fileValidator: FileValidatorService,
    private fileStorage: FileStorageService,
  ) {}

  /**
   * Dosya yükleme
   */
  async uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
    userId: number,
  ): Promise<File> {
    // Dosya validasyonu
    this.fileValidator.validateFile(file);

    // Güvenli dosya adı oluştur
    const extension = this.fileValidator.getFileExtension(file.originalname);
    const uuid = uuidv4();
    const storedName = `${uuid}-${file.originalname}`;

    try {
      // Dosyayı storage'a kaydet
      const filePath = await this.fileStorage.saveFile(
        file.buffer,
        storedName,
        undefined,
        StorageType.LOCAL,
      );

      // File entity oluştur
      const newFile = new File({
        originalName: file.originalname,
        storedName,
        path: filePath,
        mimeType: file.mimetype || this.fileValidator.getMimeType(file.originalname),
        size: BigInt(file.size),
        category: dto.category || FileCategory.GENERAL,
        storageType: StorageType.LOCAL,
        status: FileStatus.ACTIVE,
        createdById: userId,
      });

      const savedFile = await this.fileRepository.create(newFile);

      // Eğer entityType ve entityId verilmişse attachment oluştur
      if (dto.entityType && dto.entityId) {
        await this.attachFileToEntity(
          savedFile.id,
          dto.entityType,
          dto.entityId,
          dto.description,
          userId,
        );
      }

      this.logger.log(`File uploaded: ${savedFile.id} - ${savedFile.originalName}`);
      return savedFile;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw new BadRequestException(`Dosya yüklenirken hata oluştu: ${error.message}`);
    }
  }

  /**
   * Çoklu dosya yükleme
   */
  async uploadFiles(
    files: Express.Multer.File[],
    dto: UploadFileDto,
    userId: number,
  ): Promise<File[]> {
    const uploadedFiles: File[] = [];

    for (const file of files) {
      try {
        const uploadedFile = await this.uploadFile(file, dto, userId);
        uploadedFiles.push(uploadedFile);
      } catch (error) {
        this.logger.error(`Error uploading file ${file.originalname}: ${error.message}`);
        // Bir dosya başarısız olsa bile diğerlerini yüklemeye devam et
      }
    }

    return uploadedFiles;
  }

  /**
   * Dosyayı entity'ye bağla
   */
  async attachFileToEntity(
    fileId: number,
    entityType: string,
    entityId: number,
    description?: string,
    userId?: number,
  ): Promise<FileAttachment> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    const attachment = new FileAttachment({
      fileId,
      entityType,
      entityId,
      description,
      createdById: userId,
    });

    return this.fileAttachmentRepository.create(attachment);
  }

  /**
   * Dosya indirme
   */
  async downloadFile(id: number): Promise<{ stream: NodeJS.ReadableStream; file: File }> {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    if (file.status === FileStatus.DELETED) {
      throw new NotFoundException('Dosya silinmiş');
    }

    const stream = this.fileStorage.getFileStream(file.path, file.storageType);
    return { stream, file };
  }

  /**
   * Dosya listeleme
   */
  async findAll(filterDto: FilterFileDto): Promise<File[]> {
    let files: File[] = [];

    if (filterDto.category) {
      files = await this.fileRepository.findByCategory(filterDto.category);
    } else if (filterDto.status) {
      files = await this.fileRepository.findByStatus(filterDto.status);
    } else if (filterDto.mimeType) {
      files = await this.fileRepository.findByMimeType(filterDto.mimeType);
    } else if (filterDto.search) {
      files = await this.fileRepository.searchByOriginalName(filterDto.search);
    } else if (filterDto.entityType && filterDto.entityId) {
      // Entity'ye bağlı dosyalar
      const attachments = await this.fileAttachmentRepository.findByEntity(
        filterDto.entityType,
        filterDto.entityId,
      );
      files = attachments.map(a => a.file!).filter(f => f !== undefined);
    } else {
      files = await this.fileRepository.findAll();
    }

    // Ek filtreleme
    if (filterDto.category && !filterDto.search) {
      files = files.filter(f => f.category === filterDto.category);
    }
    if (filterDto.status) {
      files = files.filter(f => f.status === filterDto.status);
    }

    return files;
  }

  /**
   * Dosya detayı
   */
  async findById(id: number): Promise<File> {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException('Dosya bulunamadı');
    }
    return file;
  }

  /**
   * Entity'ye bağlı dosyaları getir
   */
  async findByEntity(entityType: string, entityId: number): Promise<FileAttachment[]> {
    return this.fileAttachmentRepository.findByEntity(entityType, entityId);
  }

  /**
   * Dosya silme (soft delete)
   */
  async delete(id: number, userId: number): Promise<void> {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    // Soft delete
    await this.fileRepository.update(id, {
      status: FileStatus.DELETED,
      deletedAt: new Date(),
      deletedById: userId,
    });

    this.logger.log(`File soft deleted: ${id}`);
  }

  /**
   * Dosyayı kalıcı olarak sil (fiziksel dosya + DB kaydı)
   */
  async deletePermanently(id: number, userId: number): Promise<void> {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    try {
      // Fiziksel dosyayı sil
      await this.fileStorage.deleteFile(file.path, file.storageType);

      // Attachment'ları sil
      await this.fileAttachmentRepository.deleteByFile(id);

      // DB kaydını sil
      await this.fileRepository.delete(id, userId);

      this.logger.log(`File permanently deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting file permanently: ${error.message}`, error.stack);
      throw new BadRequestException(`Dosya silinirken hata oluştu: ${error.message}`);
    }
  }

  /**
   * Attachment'ı sil
   */
  async detachFile(attachmentId: number): Promise<void> {
    await this.fileAttachmentRepository.delete(attachmentId);
  }
}

