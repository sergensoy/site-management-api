import { Injectable } from '@nestjs/common';
import { IExpenseRepository } from '../../core/repositories/i-expense.repository';
import { Expense } from '../../core/entities/expense.entity';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseMapper } from '../mappers/expense.mapper';

@Injectable()
export class PrismaExpenseRepository implements IExpenseRepository {
  constructor(private prisma: PrismaService) {}

  async create(expense: Expense): Promise<Expense> {
    const data = ExpenseMapper.toPersistence(expense);
    const created = await this.prisma.expense.create({ data });
    return ExpenseMapper.toDomain(created);
  }

  async findAll(): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'desc' },
    });
    return expenses.map(ExpenseMapper.toDomain);
  }

  async findById(id: number): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.deletedAt) return null;
    return ExpenseMapper.toDomain(expense);
  }

  async update(id: number, expense: Partial<Expense>): Promise<Expense> {
    const updateData: any = {};
    if (expense.siteId !== undefined) updateData.siteId = expense.siteId;
    if (expense.amount !== undefined) updateData.amount = expense.amount;
    if (expense.description !== undefined) updateData.description = expense.description;
    if (expense.date !== undefined) updateData.date = expense.date;
    if (expense.type !== undefined) updateData.type = expense.type;
    if (expense.status !== undefined) updateData.status = expense.status;
    if (expense.updatedById !== undefined) updateData.updatedById = expense.updatedById;

    const updated = await this.prisma.expense.update({
      where: { id },
      data: updateData,
    });
    return ExpenseMapper.toDomain(updated);
  }

  async delete(id: number, deletedById?: number): Promise<void> {
    await this.prisma.expense.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  }

  async findBySiteId(siteId: number): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        siteId,
        deletedAt: null,
      },
      orderBy: { date: 'desc' },
    });
    return expenses.map(ExpenseMapper.toDomain);
  }

  async findByDateRange(start: Date, end: Date): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        deletedAt: null,
      },
      orderBy: { date: 'desc' },
    });
    return expenses.map(ExpenseMapper.toDomain);
  }

  async findByType(type: string): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        type: type as any,
        deletedAt: null,
      },
      orderBy: { date: 'desc' },
    });
    return expenses.map(ExpenseMapper.toDomain);
  }
}

