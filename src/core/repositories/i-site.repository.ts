import { IGenericRepository } from './i-generic.repository';
import { Site } from '../entities/site.entity';

export interface ISiteRepository extends IGenericRepository<Site> {
  // Site'a özel ek metodlar gerekirse buraya eklenir
  // Örn: findByCity(city: string): Promise<Site[]>;
}

export const ISiteRepository = Symbol('ISiteRepository');