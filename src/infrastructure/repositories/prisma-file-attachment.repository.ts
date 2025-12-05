import { Injectable } from '@nestjs/common';
import { IFileAttachmentRepository } from '../../core/repositories/i-file-attachment.repository';
import { FileAttachment } from '../../core/entities/file-attachment.entity';
import { PrismaService } from '../prisma/prisma.service';
import { FileAttachmentMapper } from '../mappers/file-attachment.mapper';

@Injectable()
export class PrismaFileAttachmentRepository implements IFileAttachmentRepository {
  constructor(private prisma: PrismaService) {}

  async create(attachment: FileAttachment): Promise<FileAttachment> {
    const data = FileAttachmentMapper.toPersistence(attachment);
    const created = await this.prisma.fileAttachment.create({
      data,
      include: { file: true },
    });
    return FileAttachmentMapper.toDomain(created);
  }

  async update(id: number, attachment: Partial<FileAttachment>): Promise<FileAttachment> {
    const updated = await this.prisma.fileAttachment.update({
      where: { id },
      data: {
        description: attachment.description,
      },
      include: { file: true },
    });
    return FileAttachmentMapper.toDomain(updated);
  }

  async findById(id: number): Promise<FileAttachment | null> {
    const attachment = await this.prisma.fileAttachment.findUnique({
      where: { id },
      include: { file: true },
    });
    return attachment ? FileAttachmentMapper.toDomain(attachment) : null;
  }

  async findAll(): Promise<FileAttachment[]> {
    const attachments = await this.prisma.fileAttachment.findMany({
      include: { file: true },
    });
    return attachments.map(FileAttachmentMapper.toDomain);
  }

  async delete(id: number, deletedById?: number): Promise<void> {
    await this.prisma.fileAttachment.delete({ where: { id } });
  }

  async findByEntity(entityType: string, entityId: number): Promise<FileAttachment[]> {
    const attachments = await this.prisma.fileAttachment.findMany({
      where: { entityType, entityId },
      include: { file: true },
    });
    return attachments.map(FileAttachmentMapper.toDomain);
  }

  async findByFile(fileId: number): Promise<FileAttachment[]> {
    const attachments = await this.prisma.fileAttachment.findMany({
      where: { fileId },
      include: { file: true },
    });
    return attachments.map(FileAttachmentMapper.toDomain);
  }

  async deleteByEntity(entityType: string, entityId: number): Promise<void> {
    await this.prisma.fileAttachment.deleteMany({
      where: { entityType, entityId },
    });
  }

  async deleteByFile(fileId: number): Promise<void> {
    await this.prisma.fileAttachment.deleteMany({
      where: { fileId },
    });
  }
}

