import { Injectable } from '@nestjs/common';
import { IResidencyRepository } from '../../core/repositories/i-residency.repository';
import { Residency, ResidencyStatus } from '../../core/entities/residency.entity';
import { PrismaService } from '../prisma/prisma.service';
import { ResidencyMapper } from '../mappers/residency.mapper';

@Injectable()
export class PrismaResidencyRepository implements IResidencyRepository {
  constructor(private prisma: PrismaService) {}

  async create(residency: Residency): Promise<Residency> {
    const data = ResidencyMapper.toPersistence(residency);
    const created = await this.prisma.residency.create({
      data,
      include: {
        user: true,
        unit: true,
      },
    });
    return ResidencyMapper.toDomain(created);
  }

  async findAll(): Promise<Residency[]> {
    const residencies = await this.prisma.residency.findMany({
      where: { deletedAt: null },
      include: {
        user: true,
        unit: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return residencies.map(ResidencyMapper.toDomain);
  }

  async findById(id: number): Promise<Residency | null> {
    const residency = await this.prisma.residency.findUnique({
      where: { id },
      include: {
        user: true,
        unit: true,
      },
    });
    if (!residency || residency.deletedAt) return null;
    return ResidencyMapper.toDomain(residency);
  }

  async update(id: number, residency: Partial<Residency>): Promise<Residency> {
    const updateData: any = {};
    if (residency.unitId !== undefined) updateData.unitId = residency.unitId;
    if (residency.userId !== undefined) updateData.userId = residency.userId;
    if (residency.type !== undefined) updateData.type = residency.type;
    if (residency.status !== undefined) updateData.status = residency.status;
    if (residency.moveInDate !== undefined) updateData.moveInDate = residency.moveInDate;
    if (residency.moveOutDate !== undefined) updateData.moveOutDate = residency.moveOutDate;

    const updated = await this.prisma.residency.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        unit: true,
      },
    });
    return ResidencyMapper.toDomain(updated);
  }

  async delete(id: number, deletedById?: number): Promise<void> {
    await this.prisma.residency.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findByUnitId(unitId: number): Promise<Residency[]> {
    const residencies = await this.prisma.residency.findMany({
      where: {
        unitId,
        deletedAt: null,
      },
      include: {
        user: true,
        unit: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return residencies.map(ResidencyMapper.toDomain);
  }

  async findByUserId(userId: number): Promise<Residency[]> {
    const residencies = await this.prisma.residency.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        user: true,
        unit: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return residencies.map(ResidencyMapper.toDomain);
  }

  async findActiveByUnit(unitId: number): Promise<Residency[]> {
    const residencies = await this.prisma.residency.findMany({
      where: {
        unitId,
        status: ResidencyStatus.ACTIVE,
        deletedAt: null,
      },
      include: {
        user: true,
        unit: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return residencies.map(ResidencyMapper.toDomain);
  }

  async findActiveByUser(userId: number): Promise<Residency | null> {
    const residency = await this.prisma.residency.findFirst({
      where: {
        userId,
        status: ResidencyStatus.ACTIVE,
        deletedAt: null,
      },
      include: {
        user: true,
        unit: true,
      },
    });
    if (!residency) return null;
    return ResidencyMapper.toDomain(residency);
  }
}

