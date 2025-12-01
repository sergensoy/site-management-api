import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IExpenseRepository } from '../../core/repositories/i-expense.repository';
import { Expense, TransactionStatus } from '../../core/entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @Inject(IExpenseRepository) private expenseRepository: IExpenseRepository,
  ) {}

  async create(dto: CreateExpenseDto, userId: number): Promise<Expense> {
    const newExpense = new Expense({
      ...dto,
      status: TransactionStatus.CONFIRMED,
      createdById: userId,
    });
    return this.expenseRepository.create(newExpense);
  }

  async findAll(filterDto: FilterExpenseDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    let expenses: Expense[];

    if (filterDto.siteId) {
      expenses = await this.expenseRepository.findBySiteId(filterDto.siteId);
    } else if (filterDto.dateFrom && filterDto.dateTo) {
      expenses = await this.expenseRepository.findByDateRange(
        filterDto.dateFrom,
        filterDto.dateTo,
      );
    } else if (filterDto.type) {
      expenses = await this.expenseRepository.findByType(filterDto.type);
    } else {
      expenses = await this.expenseRepository.findAll();
    }

    // Filtreleme
    if (filterDto.type && !filterDto.siteId) {
      expenses = expenses.filter(e => e.type === filterDto.type);
    }
    if (filterDto.siteId && expenses.length > 0 && expenses[0].siteId !== filterDto.siteId) {
      expenses = expenses.filter(e => e.siteId === filterDto.siteId);
    }
    if (filterDto.dateFrom) {
      expenses = expenses.filter(e => e.date >= filterDto.dateFrom!);
    }
    if (filterDto.dateTo) {
      expenses = expenses.filter(e => e.date <= filterDto.dateTo!);
    }

    const total = expenses.length;
    const paginatedExpenses = expenses.slice(skip, skip + limit);

    return {
      data: paginatedExpenses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new NotFoundException('Gider bulunamadı.');
    }
    return expense;
  }

  async update(id: number, dto: UpdateExpenseDto, userId: number): Promise<Expense> {
    await this.findOne(id);
    return this.expenseRepository.update(id, {
      ...dto,
      updatedById: userId,
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id);
    return this.expenseRepository.delete(id, userId);
  }

  async findBySite(siteId: number): Promise<Expense[]> {
    return this.expenseRepository.findBySiteId(siteId);
  }

  async cancel(id: number, userId: number): Promise<Expense> {
    await this.findOne(id);
    return this.expenseRepository.update(id, {
      status: TransactionStatus.CANCELED,
      updatedById: userId,
    });
  }
}

