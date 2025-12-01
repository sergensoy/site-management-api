import { Injectable } from '@nestjs/common';
import { IPaymentRepository } from '../../core/repositories/i-payment.repository';
import { Payment } from '../../core/entities/payment.entity';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMapper } from '../mappers/payment.mapper';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private prisma: PrismaService) {}

  async create(payment: Payment): Promise<Payment> {
    const data = PaymentMapper.toPersistence(payment);
    const created = await this.prisma.payment.create({ data });
    return PaymentMapper.toDomain(created);
  }

  async findAll(): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { deletedAt: null },
      orderBy: { paymentDate: 'desc' },
    });
    return payments.map(PaymentMapper.toDomain);
  }

  async findById(id: number): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment || payment.deletedAt) return null;
    return PaymentMapper.toDomain(payment);
  }

  async update(id: number, payment: Partial<Payment>): Promise<Payment> {
    const updateData: any = {};
    if (payment.amount !== undefined) updateData.amount = payment.amount;
    if (payment.paymentDate !== undefined) updateData.paymentDate = payment.paymentDate;
    if (payment.paymentMethod !== undefined) updateData.paymentMethod = payment.paymentMethod;
    if (payment.status !== undefined) updateData.status = payment.status;

    const updated = await this.prisma.payment.update({
      where: { id },
      data: updateData,
    });
    return PaymentMapper.toDomain(updated);
  }

  async delete(id: number, deletedById?: number): Promise<void> {
    await this.prisma.payment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findByDebtId(debtId: number): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        debtId,
        deletedAt: null,
      },
      orderBy: { paymentDate: 'desc' },
    });
    return payments.map(PaymentMapper.toDomain);
  }

  async findByDateRange(start: Date, end: Date): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: start,
          lte: end,
        },
        deletedAt: null,
      },
      orderBy: { paymentDate: 'desc' },
    });
    return payments.map(PaymentMapper.toDomain);
  }

  async getTotalByDebt(debtId: number): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      where: {
        debtId,
        deletedAt: null,
        status: 'CONFIRMED',
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ? Number(result._sum.amount) : 0;
  }
}

