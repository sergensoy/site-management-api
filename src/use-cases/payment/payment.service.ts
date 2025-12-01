import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IPaymentRepository } from '../../core/repositories/i-payment.repository';
import { IDebtRepository } from '../../core/repositories/i-debt.repository';
import { Payment } from '../../core/entities/payment.entity';
import { TransactionStatus } from '../../core/entities/expense.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { FilterPaymentDto } from './dto/filter-payment.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PaymentMapper } from '../../infrastructure/mappers/payment.mapper';
import { PaymentCreatedEvent } from '../../core/events/payment-created.event';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(IPaymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(IDebtRepository) private debtRepository: IDebtRepository,
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreatePaymentDto, userId: number): Promise<Payment> {
    // Debt'in var olduğunu kontrol et
    const debt = await this.debtRepository.findById(dto.debtId);
    if (!debt) {
      throw new NotFoundException('Borç bulunamadı.');
    }

    // Transaction içinde çalış
    return this.prisma.$transaction(async (tx) => {
      // Payment oluştur (doğrudan Prisma kullan)
      const newPaymentData = {
        debtId: dto.debtId,
        amount: dto.amount,
        paymentDate: dto.paymentDate || new Date(),
        paymentMethod: dto.paymentMethod,
        status: TransactionStatus.CONFIRMED,
        createdById: userId,
      };

      const savedPaymentPrisma = await tx.payment.create({
        data: newPaymentData,
      });

      const savedPayment = PaymentMapper.toDomain(savedPaymentPrisma);

      // Debt'in toplam ödeme tutarını hesapla
      const totalPaidResult = await tx.payment.aggregate({
        where: {
          debtId: dto.debtId,
          deletedAt: null,
          status: 'CONFIRMED',
        },
        _sum: {
          amount: true,
        },
      });

      const totalPaid = totalPaidResult._sum.amount ? Number(totalPaidResult._sum.amount) : 0;

      // Eğer borç tamamen ödendiyse isPaid = true yap
      if (totalPaid >= debt.amount) {
        await tx.debt.update({
          where: { id: dto.debtId },
          data: { isPaid: true },
        });
      }

      // Event emit et
      this.eventEmitter.emit(
        'payment.created',
        new PaymentCreatedEvent(
          savedPayment.id,
          debt.payerId,
          debt.id,
          Number(savedPayment.amount),
        ),
      );

      return savedPayment;
    });
  }

  async findAll(filterDto: FilterPaymentDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    let payments: Payment[];

    if (filterDto.debtId) {
      payments = await this.paymentRepository.findByDebtId(filterDto.debtId);
    } else if (filterDto.dateFrom && filterDto.dateTo) {
      payments = await this.paymentRepository.findByDateRange(
        filterDto.dateFrom,
        filterDto.dateTo,
      );
    } else {
      payments = await this.paymentRepository.findAll();
    }

    // Filtreleme
    if (filterDto.dateFrom && !filterDto.debtId) {
      payments = payments.filter(p => p.paymentDate >= filterDto.dateFrom!);
    }
    if (filterDto.dateTo && !filterDto.debtId) {
      payments = payments.filter(p => p.paymentDate <= filterDto.dateTo!);
    }

    const total = payments.length;
    const paginatedPayments = payments.slice(skip, skip + limit);

    return {
      data: paginatedPayments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException('Ödeme bulunamadı.');
    }
    return payment;
  }

  async findByDebt(debtId: number): Promise<Payment[]> {
    return this.paymentRepository.findByDebtId(debtId);
  }

  async getDebtRemaining(debtId: number): Promise<number> {
    const debt = await this.debtRepository.findById(debtId);
    if (!debt) {
      throw new NotFoundException('Borç bulunamadı.');
    }

    const totalPaid = await this.paymentRepository.getTotalByDebt(debtId);
    return Math.max(0, debt.amount - totalPaid);
  }

  async cancel(id: number): Promise<Payment> {
    const payment = await this.findOne(id);

    // Transaction içinde çalış
    return this.prisma.$transaction(async (tx) => {
      // Payment'ı iptal et
      const canceledPaymentPrisma = await tx.payment.update({
        where: { id },
        data: { status: TransactionStatus.CANCELED },
      });

      const canceledPayment = PaymentMapper.toDomain(canceledPaymentPrisma);

      // Debt'in ödeme durumunu yeniden kontrol et
      const debt = await tx.debt.findUnique({ where: { id: payment.debtId } });
      if (debt) {
        const totalPaidResult = await tx.payment.aggregate({
          where: {
            debtId: payment.debtId,
            deletedAt: null,
            status: 'CONFIRMED',
          },
          _sum: {
            amount: true,
          },
        });

        const totalPaid = totalPaidResult._sum.amount ? Number(totalPaidResult._sum.amount) : 0;

        if (totalPaid < Number(debt.amount)) {
          // Borç tamamen ödenmemiş, isPaid'i false yap
          await tx.debt.update({
            where: { id: payment.debtId },
            data: { isPaid: false },
          });
        }
      }

      return canceledPayment;
    });
  }
}

