import { IGenericRepository } from './i-generic.repository';
import { Unit } from '../entities/unit.entity';

export interface IUnitRepository extends IGenericRepository<Unit> {
  // Bir bloğa ait tüm daireleri getir
  findAllByBlockId(blockId: number): Promise<Unit[]>;
}

export const IUnitRepository = Symbol('IUnitRepository');