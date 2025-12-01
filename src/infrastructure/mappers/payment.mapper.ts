import { Payment as PrismaPayment, Prisma } from '@prisma/client';
import { Payment } from '../../core/entities/payment.entity';

export class PaymentMapper {
  static toDomain(raw: PrismaPayment): Payment {
    return new Payment({
      id: raw.id,
      debtId: raw.debtId,
      amount: Number(raw.amount),
      paymentDate: raw.paymentDate,
      paymentMethod: raw.paymentMethod,
      status: raw.status as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
    });
  }

  static toPersistence(payment: Partial<Payment>): Prisma.PaymentUncheckedCreateInput {
    return {
      debtId: payment.debtId!,
      amount: payment.amount ?? 0,
      paymentDate: payment.paymentDate!,
      paymentMethod: payment.paymentMethod!,
      status: payment.status!,
      createdById: payment.createdById,
      deletedAt: payment.deletedAt,
    };
  }
}

