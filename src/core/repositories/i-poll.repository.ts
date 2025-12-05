import { IGenericRepository } from './i-generic.repository';
import { Poll } from '../entities/poll.entity';
import { PollStatus } from '../entities/poll-status.enum';

export interface IPollRepository extends IGenericRepository<Poll> {
  findByStatus(status: PollStatus): Promise<Poll[]>;
  findActive(): Promise<Poll[]>;
  findExpired(): Promise<Poll[]>;
  findBySite(siteId: number): Promise<Poll[]>;
  findByCreator(createdById: number): Promise<Poll[]>;
}

export const IPollRepository = Symbol('IPollRepository');

