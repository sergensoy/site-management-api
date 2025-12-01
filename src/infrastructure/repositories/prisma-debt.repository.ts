import { Injectable } from '@nestjs/common';
import { IDebtRepository } from '../../core/repositories/i-debt.repository';
import { Debt } from '../../core/entities/debt.entity';
import { PrismaService } from '../prisma/prisma.service';
import { DebtMapper } from '../mappers/debt.mapper';

@Injectable()
export class PrismaDebtRepository implements IDebtRepository {
  constructor(private prisma: PrismaService) {}

  async create(debt: Debt): Promise<Debt> {
    const data = DebtMapper.toPersistence(debt);
    const created = await this.prisma.debt.create({
      data,
      include: {
        payments: true,
      },
    });
    return DebtMapper.toDomain(created);
  }

  async findAll(): Promise<Debt[]> {
    const debts = await this.prisma.debt.findMany({
      where: { deletedAt: null },
      include: {
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
    return debts.map(DebtMapper.toDomain);
  }

  async findById(id: number): Promise<Debt | null> {
    const debt = await this.prisma.debt.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });
    if (!debt || debt.deletedAt) return null;
    return DebtMapper.toDomain(debt);
  }

  async update(id: number, debt: Partial<Debt>): Promise<Debt> {
    const updateData: any = {};
    if (debt.payerId !== undefined) updateData.payerId = debt.payerId;
    if (debt.unitId !== undefined) updateData.unitId = debt.unitId;
    if (debt.amount !== undefined) updateData.amount = debt.amount;
    if (debt.description !== undefined) updateData.description = debt.description;
    if (debt.type !== undefined) updateData.type = debt.type;
    if (debt.dueDate !== undefined) updateData.dueDate = debt.dueDate;
    if (debt.isPaid !== undefined) updateData.isPaid = debt.isPaid;
    if (debt.status !== undefined) updateData.status = debt.status;

    const updated = await this.prisma.debt.update({
      where: { id },
      data: updateData,
      include: {
        payments: true,
      },
    });
    return DebtMapper.toDomain(updated);
  }

  async delete(id: number, deletedById?: number): Promise<void> {
    await this.prisma.debt.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findByUnitId(unitId: number): Promise<Debt[]> {
    const debts = await this.prisma.debt.findMany({
      where: {
        unitId,
        deletedAt: null,
      },
      include: {
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
    return debts.map(DebtMapper.toDomain);
  }

  async findByPayerId(payerId: number): Promise<Debt[]> {
    const debts = await this.prisma.debt.findMany({
      where: {
        payerId,
        deletedAt: null,
      },
      include: {
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
    return debts.map(DebtMapper.toDomain);
  }

  async findUnpaid(): Promise<Debt[]> {
    const debts = await this.prisma.debt.findMany({
      where: {
        isPaid: false,
        deletedAt: null,
      },
      include: {
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
    return debts.map(DebtMapper.toDomain);
  }

  async findOverdue(): Promise<Debt[]> {
    const now = new Date();
    const debts = await this.prisma.debt.findMany({
      where: {
        isPaid: false,
        dueDate: {
          lt: now,
        },
        deletedAt: null,
      },
      include: {
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
    return debts.map(DebtMapper.toDomain);
  }

  async markAsPaid(id: number): Promise<void> {
    await this.prisma.debt.update({
      where: { id },
      data: {
        isPaid: true,
      },
    });
  }
}

