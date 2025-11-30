import { Unit as PrismaUnit } from '@prisma/client';
import { Unit } from '../../core/entities/unit.entity';

export class UnitMapper {
  static toDomain(raw: PrismaUnit): Unit {
    return new Unit({
      id: raw.id,
      blockId: raw.blockId,
      unitNumber: raw.unitNumber,
      floor: raw.floor,
      shareOfLand: raw.shareOfLand ? Number(raw.shareOfLand) : null, // Decimal -> Number
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toPersistence(unit: Unit): Partial<PrismaUnit> {
    return {
      blockId: unit.blockId,
      unitNumber: unit.unitNumber,
      floor: unit.floor,
      shareOfLand: unit.shareOfLand as any, // Prisma Decimal bekler, otomatik dönüşüm için
      createdById: unit.createdById,
      updatedById: unit.updatedById,
      deletedById: unit.deletedById,
      deletedAt: unit.deletedAt,
    };
  }
}