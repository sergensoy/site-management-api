import { Injectable } from '@nestjs/common';
import { IFileRepository } from '../../core/repositories/i-file.repository';
import { File } from '../../core/entities/file.entity';
import { PrismaService } from '../prisma/prisma.service';
import { FileMapper } from '../mappers/file.mapper';
import { FileCategory } from '../../core/entities/file-category.enum';
import { FileStatus } from '../../core/entities/file-status.enum';

@Injectable()
export class PrismaFileRepository implements IFileRepository {
  constructor(private prisma: PrismaService) {}

  async create(file: File): Promise<File> {
    const data = FileMapper.toPersistence(file);
    const created = await this.prisma.file.create({ data });
    return FileMapper.toDomain(created);
  }

  async update(id: number, file: Partial<File>): Promise<File> {
    const updated = await this.prisma.file.update({
      where: { id },
      data: {
        originalName: file.originalName,
        storedName: file.storedName,
        path: file.path,
        mimeType: file.mimeType,
        size: file.size,
        category: file.category,
        storageType: file.storageType,
        status: file.status,
        updatedById: file.updatedById,
        deletedAt: file.deletedAt,
      },
    });
    return FileMapper.toDomain(updated);
  }

  async findById(id: number): Promise<File | null> {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file || file.deletedAt) return null;
    return FileMapper.toDomain(file);
  }

  async findAll(): Promise<File[]> {
    const files = await this.prisma.file.findMany({
      where: { deletedAt: null },
    });
    return files.map(FileMapper.toDomain);
  }

  async delete(id: number, deletedById?: number): Promise<void> {
    await this.prisma.file.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  }

  async findByCategory(category: FileCategory): Promise<File[]> {
    const files = await this.prisma.file.findMany({
      where: { category, deletedAt: null },
    });
    return files.map(FileMapper.toDomain);
  }

  async findByStatus(status: FileStatus): Promise<File[]> {
    const files = await this.prisma.file.findMany({
      where: { status, deletedAt: null },
    });
    return files.map(FileMapper.toDomain);
  }

  async findByMimeType(mimeType: string): Promise<File[]> {
    const files = await this.prisma.file.findMany({
      where: { mimeType, deletedAt: null },
    });
    return files.map(FileMapper.toDomain);
  }

  async searchByOriginalName(searchTerm: string): Promise<File[]> {
    const files = await this.prisma.file.findMany({
      where: {
        originalName: { contains: searchTerm },
        deletedAt: null,
      },
    });
    return files.map(FileMapper.toDomain);
  }

  async findByPath(path: string): Promise<File | null> {
    const file = await this.prisma.file.findFirst({
      where: { path, deletedAt: null },
    });
    return file ? FileMapper.toDomain(file) : null;
  }
}

