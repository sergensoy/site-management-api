import { Residency as PrismaResidency } from '@prisma/client';
import { Residency } from '../../core/entities/residency.entity';

export class ResidencyMapper {
  static toDomain(raw: PrismaResidency): Residency {
    return new Residency({
      id: raw.id,
      unitId: raw.unitId,
      userId: raw.userId,
      type: raw.type as any,
      status: raw.status as any,
      moveInDate: raw.moveInDate,
      moveOutDate: raw.moveOutDate,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(residency: Partial<Residency>): any {
    return {
      unitId: residency.unitId!,
      userId: residency.userId!,
      type: residency.type!,
      status: residency.status!,
      moveInDate: residency.moveInDate,
      moveOutDate: residency.moveOutDate,
      deletedAt: residency.deletedAt,
    };
  }
}

