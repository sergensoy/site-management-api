import { Injectable } from '@nestjs/common';
import { ISiteRepository } from '../../core/repositories/i-site.repository';
import { Site } from '../../core/entities/site.entity';
import { PrismaService } from '../prisma/prisma.service';
import { SiteMapper } from '../mappers/site.mapper';

@Injectable()
export class PrismaSiteRepository implements ISiteRepository {
  constructor(private prisma: PrismaService) {}

  async create(site: Site): Promise<Site> {
    const data = SiteMapper.toPersistence(site);
    const created = await this.prisma.site.create({ data });
    return SiteMapper.toDomain(created);
  }

  async findAll(): Promise<Site[]> {
    const sites = await this.prisma.site.findMany({
      where: { deletedAt: null }, // Soft Delete Filtresi
    });
    return sites.map(SiteMapper.toDomain);
  }

  async findById(id: number): Promise<Site | null> {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site || site.deletedAt) return null;
    return SiteMapper.toDomain(site);
  }

  async update(id: number, site: Partial<Site>): Promise<Site> {
    // Burada toPersistence kullanmak yerine partial update objesi oluşturuyoruz
    const updated = await this.prisma.site.update({
      where: { id },
      data: {
        name: site.name,
        address: site.address,
        city: site.city,
        defaultDues: site.defaultDues,
        updatedById: site.updatedById,
      },
    });
    return SiteMapper.toDomain(updated);
  }

  async delete(id: number, deletedById: number): Promise<void> {
    // Soft Delete
    await this.prisma.site.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  }
}