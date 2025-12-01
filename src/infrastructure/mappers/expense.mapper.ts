import { Expense as PrismaExpense, Prisma } from '@prisma/client';
import { Expense } from '../../core/entities/expense.entity';

export class ExpenseMapper {
  static toDomain(raw: PrismaExpense): Expense {
    return new Expense({
      id: raw.id,
      siteId: raw.siteId,
      amount: Number(raw.amount),
      description: raw.description,
      date: raw.date,
      type: raw.type as any,
      status: raw.status as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toPersistence(expense: Partial<Expense>): Prisma.ExpenseUncheckedCreateInput {
    return {
      siteId: expense.siteId!,
      amount: expense.amount ?? 0,
      description: expense.description!,
      date: expense.date!,
      type: expense.type!,
      status: expense.status!,
      createdById: expense.createdById,
      updatedById: expense.updatedById,
      deletedById: expense.deletedById,
      deletedAt: expense.deletedAt,
    };
  }
}

