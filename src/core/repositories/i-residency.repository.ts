import { IGenericRepository } from './i-generic.repository';
import { Residency } from '../entities/residency.entity';

export interface IResidencyRepository extends IGenericRepository<Residency> {
  findByUnitId(unitId: number): Promise<Residency[]>;
  findByUserId(userId: number): Promise<Residency[]>;
  findActiveByUnit(unitId: number): Promise<Residency[]>;
  findActiveByUser(userId: number): Promise<Residency | null>;
}

export const IResidencyRepository = Symbol('IResidencyRepository');

