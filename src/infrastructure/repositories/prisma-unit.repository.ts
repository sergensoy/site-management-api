import { Injectable } from '@nestjs/common';
import { IUnitRepository } from '../../core/repositories/i-unit.repository';
import { Unit } from '../../core/entities/unit.entity';
import { PrismaService } from '../prisma/prisma.service';
import { UnitMapper } from '../mappers/unit.mapper';

@Injectable()
export class PrismaUnitRepository implements IUnitRepository {
  constructor(private prisma: PrismaService) {}

  async create(unit: Unit): Promise<Unit> {
    const data = UnitMapper.toPersistence(unit);
    const created = await this.prisma.unit.create({ data: data as any });
    return UnitMapper.toDomain(created);
  }

  async findAll(): Promise<Unit[]> {
    const units = await this.prisma.unit.findMany({
      where: { deletedAt: null },
    });
    return units.map(UnitMapper.toDomain);
  }

  async findAllByBlockId(blockId: number): Promise<Unit[]> {
    const units = await this.prisma.unit.findMany({
      where: { blockId, deletedAt: null },
    });
    return units.map(UnitMapper.toDomain);
  }

  async findById(id: number): Promise<Unit | null> {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit || unit.deletedAt) return null;
    return UnitMapper.toDomain(unit);
  }

  async update(id: number, unit: Partial<Unit>): Promise<Unit> {
    const updated = await this.prisma.unit.update({
      where: { id },
      data: {
        unitNumber: unit.unitNumber,
        floor: unit.floor,
        shareOfLand: unit.shareOfLand,
        updatedById: unit.updatedById,
      },
    });
    return UnitMapper.toDomain(updated);
  }

  async delete(id: number, deletedById: number): Promise<void> {
    await this.prisma.unit.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  }
}