// src/infrastructure/mappers/site.mapper.ts
import { Site as PrismaSite, Prisma } from '@prisma/client';
import { Site } from '../../core/entities/site.entity';

export class SiteMapper {
  static toDomain(raw: PrismaSite): Site {
    return new Site({
      id: raw.id,
      name: raw.name,
      address: raw.address,
      city: raw.city,
      defaultDues: Number(raw.defaultDues), // Decimal -> Number
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  // Domain -> Prisma (Kaydetme/Güncelleme için)
  static toPersistence(site: Partial<Site>): Prisma.SiteUncheckedCreateInput {
    return {
      name: site.name!,
      address: site.address,
      city: site.city,
      defaultDues: site.defaultDues,
      createdById: site.createdById,
      updatedById: site.updatedById,
      deletedById: site.deletedById,
      deletedAt: site.deletedAt
    };
  }
}