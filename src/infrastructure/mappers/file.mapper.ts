import { File as PrismaFile, Prisma } from '@prisma/client';
import { File } from '../../core/entities/file.entity';
import { FileCategory } from '../../core/entities/file-category.enum';
import { FileStatus } from '../../core/entities/file-status.enum';
import { StorageType } from '../../core/entities/storage-type.enum';

export class FileMapper {
  static toDomain(raw: PrismaFile): File {
    return new File({
      id: raw.id,
      originalName: raw.originalName,
      storedName: raw.storedName,
      path: raw.path,
      mimeType: raw.mimeType,
      size: raw.size,
      category: raw.category as FileCategory,
      storageType: raw.storageType as StorageType,
      status: raw.status as FileStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toPersistence(file: Partial<File>): Prisma.FileUncheckedCreateInput {
    return {
      originalName: file.originalName!,
      storedName: file.storedName!,
      path: file.path!,
      mimeType: file.mimeType!,
      size: file.size!,
      category: file.category!,
      storageType: file.storageType!,
      status: file.status!,
      createdById: file.createdById,
      updatedById: file.updatedById,
      deletedById: file.deletedById,
      deletedAt: file.deletedAt,
    };
  }
}

