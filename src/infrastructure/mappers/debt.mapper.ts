import { Debt as PrismaDebt, Prisma } from '@prisma/client';
import { Debt } from '../../core/entities/debt.entity';

export class DebtMapper {
  static toDomain(raw: PrismaDebt): Debt {
    return new Debt({
      id: raw.id,
      payerId: raw.payerId,
      unitId: raw.unitId,
      amount: Number(raw.amount),
      description: raw.description,
      type: raw.type as any,
      dueDate: raw.dueDate,
      isPaid: raw.isPaid,
      status: raw.status as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(debt: Partial<Debt>): Prisma.DebtUncheckedCreateInput {
    return {
      payerId: debt.payerId!,
      unitId: debt.unitId!,
      amount: debt.amount ?? 0,
      description: debt.description,
      type: debt.type!,
      dueDate: debt.dueDate!,
      isPaid: debt.isPaid ?? false,
      status: debt.status!,
      deletedAt: debt.deletedAt,
    };
  }
}

