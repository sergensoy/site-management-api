import { IGenericRepository } from './i-generic.repository';
import { FileAttachment } from '../entities/file-attachment.entity';

export interface IFileAttachmentRepository extends IGenericRepository<FileAttachment> {
  findByEntity(entityType: string, entityId: number): Promise<FileAttachment[]>;
  findByFile(fileId: number): Promise<FileAttachment[]>;
  deleteByEntity(entityType: string, entityId: number): Promise<void>;
  deleteByFile(fileId: number): Promise<void>;
}

export const IFileAttachmentRepository = Symbol('IFileAttachmentRepository');

