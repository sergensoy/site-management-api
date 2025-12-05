import { FileAttachment as PrismaFileAttachment, Prisma } from '@prisma/client';
import { FileAttachment } from '../../core/entities/file-attachment.entity';
import { FileMapper } from './file.mapper';

export class FileAttachmentMapper {
  static toDomain(raw: PrismaFileAttachment & { file?: any }): FileAttachment {
    return new FileAttachment({
      id: raw.id,
      fileId: raw.fileId,
      file: raw.file ? FileMapper.toDomain(raw.file) : undefined,
      entityType: raw.entityType,
      entityId: raw.entityId,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt, // FileAttachment'da updatedAt yok, createdAt kullanıyoruz
      deletedAt: null,
      createdById: raw.createdById,
      updatedById: null,
      deletedById: null,
    });
  }

  static toPersistence(attachment: Partial<FileAttachment>): Prisma.FileAttachmentUncheckedCreateInput {
    return {
      fileId: attachment.fileId!,
      entityType: attachment.entityType!,
      entityId: attachment.entityId!,
      description: attachment.description,
      createdById: attachment.createdById,
    };
  }
}

