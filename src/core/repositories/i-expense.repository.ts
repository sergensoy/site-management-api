import { IGenericRepository } from './i-generic.repository';
import { Expense } from '../entities/expense.entity';

export interface IExpenseRepository extends IGenericRepository<Expense> {
  findBySiteId(siteId: number): Promise<Expense[]>;
  findByDateRange(start: Date, end: Date): Promise<Expense[]>;
  findByType(type: string): Promise<Expense[]>;
}

export const IExpenseRepository = Symbol('IExpenseRepository');

