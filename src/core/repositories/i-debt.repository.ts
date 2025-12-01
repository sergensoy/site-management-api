import { IGenericRepository } from './i-generic.repository';
import { Debt } from '../entities/debt.entity';

export interface IDebtRepository extends IGenericRepository<Debt> {
  findByUnitId(unitId: number): Promise<Debt[]>;
  findByPayerId(payerId: number): Promise<Debt[]>;
  findUnpaid(): Promise<Debt[]>;
  findOverdue(): Promise<Debt[]>;
  markAsPaid(id: number): Promise<void>;
}

export const IDebtRepository = Symbol('IDebtRepository');

