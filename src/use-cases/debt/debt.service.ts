import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDebtRepository } from '../../core/repositories/i-debt.repository';
import { Debt } from '../../core/entities/debt.entity';
import { TransactionStatus } from '../../core/entities/expense.entity';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { FilterDebtDto } from './dto/filter-debt.dto';

@Injectable()
export class DebtService {
  constructor(
    @Inject(IDebtRepository) private debtRepository: IDebtRepository,
  ) {}

  async create(dto: CreateDebtDto): Promise<Debt> {
    const newDebt = new Debt({
      ...dto,
      isPaid: false,
      status: TransactionStatus.CONFIRMED,
    });
    return this.debtRepository.create(newDebt);
  }

  async findAll(filterDto: FilterDebtDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    let debts: Debt[];

    if (filterDto.unitId) {
      debts = await this.debtRepository.findByUnitId(filterDto.unitId);
    } else if (filterDto.payerId) {
      debts = await this.debtRepository.findByPayerId(filterDto.payerId);
    } else if (filterDto.isPaid === false) {
      debts = await this.debtRepository.findUnpaid();
    } else {
      debts = await this.debtRepository.findAll();
    }

    // Ekstra filtreleme
    if (filterDto.isPaid !== undefined && !filterDto.unitId && !filterDto.payerId) {
      debts = debts.filter(d => d.isPaid === filterDto.isPaid);
    }

    const total = debts.length;
    const paginatedDebts = debts.slice(skip, skip + limit);

    return {
      data: paginatedDebts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Debt> {
    const debt = await this.debtRepository.findById(id);
    if (!debt) {
      throw new NotFoundException('Borç bulunamadı.');
    }
    return debt;
  }

  async update(id: number, dto: UpdateDebtDto): Promise<Debt> {
    await this.findOne(id);
    return this.debtRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    return this.debtRepository.delete(id);
  }

  async findByUnit(unitId: number): Promise<Debt[]> {
    return this.debtRepository.findByUnitId(unitId);
  }

  async findByPayer(payerId: number): Promise<Debt[]> {
    return this.debtRepository.findByPayerId(payerId);
  }

  async markAsPaid(id: number): Promise<Debt> {
    await this.findOne(id);
    await this.debtRepository.markAsPaid(id);
    return this.findOne(id);
  }

  async getOverdue(): Promise<Debt[]> {
    return this.debtRepository.findOverdue();
  }
}

