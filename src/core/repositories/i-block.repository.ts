import { IGenericRepository } from './i-generic.repository';
import { Block } from '../entities/block.entity';

export interface IBlockRepository extends IGenericRepository<Block> {
  // Bir siteye ait tüm blokları getir
  findAllBySiteId(siteId: number): Promise<Block[]>;
}

export const IBlockRepository = Symbol('IBlockRepository');