import { IGenericRepository } from './i-generic.repository';
import { PollOption } from '../entities/poll-option.entity';

export interface IPollOptionRepository extends IGenericRepository<PollOption> {
  findByQuestion(questionId: number): Promise<PollOption[]>;
  deleteByQuestion(questionId: number): Promise<void>;
}

export const IPollOptionRepository = Symbol('IPollOptionRepository');

