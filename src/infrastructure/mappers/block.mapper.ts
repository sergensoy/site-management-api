import { Block as PrismaBlock } from '@prisma/client';
import { Block } from '../../core/entities/block.entity';

export class BlockMapper {
  static toDomain(raw: PrismaBlock): Block {
    return new Block({
      id: raw.id,
      siteId: raw.siteId,
      name: raw.name,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toPersistence(block: Block): Partial<PrismaBlock> {
    return {
      name: block.name,
      siteId: block.siteId,
      createdById: block.createdById,
      updatedById: block.updatedById,
      deletedById: block.deletedById,
      deletedAt: block.deletedAt,
    };
  }
}