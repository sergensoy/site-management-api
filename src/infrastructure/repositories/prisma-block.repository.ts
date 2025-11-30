import { Injectable } from '@nestjs/common';
import { IBlockRepository } from '../../core/repositories/i-block.repository';
import { Block } from '../../core/entities/block.entity';
import { PrismaService } from '../prisma/prisma.service';
import { BlockMapper } from '../mappers/block.mapper';

@Injectable()
export class PrismaBlockRepository implements IBlockRepository {
  constructor(private prisma: PrismaService) {}

  async create(block: Block): Promise<Block> {
    const data = BlockMapper.toPersistence(block);
    // Prisma types might require specific casting depending on version, using 'as any' for generic Partial compatibility
    const created = await this.prisma.block.create({ data: data as any });
    return BlockMapper.toDomain(created);
  }

  async findAll(): Promise<Block[]> {
    const blocks = await this.prisma.block.findMany({
      where: { deletedAt: null },
    });
    return blocks.map(BlockMapper.toDomain);
  }

  async findAllBySiteId(siteId: number): Promise<Block[]> {
    const blocks = await this.prisma.block.findMany({
      where: { siteId, deletedAt: null },
    });
    return blocks.map(BlockMapper.toDomain);
  }

  async findById(id: number): Promise<Block | null> {
    const block = await this.prisma.block.findUnique({ where: { id } });
    if (!block || block.deletedAt) return null;
    return BlockMapper.toDomain(block);
  }

  async update(id: number, block: Partial<Block>): Promise<Block> {
    const updated = await this.prisma.block.update({
      where: { id },
      data: {
        name: block.name,
        updatedById: block.updatedById,
      },
    });
    return BlockMapper.toDomain(updated);
  }

  async delete(id: number, deletedById: number): Promise<void> {
    await this.prisma.block.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  }
}