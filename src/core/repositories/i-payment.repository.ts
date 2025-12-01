import { IGenericRepository } from './i-generic.repository';
import { Payment } from '../entities/payment.entity';

export interface IPaymentRepository extends IGenericRepository<Payment> {
  findByDebtId(debtId: number): Promise<Payment[]>;
  findByDateRange(start: Date, end: Date): Promise<Payment[]>;
  getTotalByDebt(debtId: number): Promise<number>;
}

export const IPaymentRepository = Symbol('IPaymentRepository');

