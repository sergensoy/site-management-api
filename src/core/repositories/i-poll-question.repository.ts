import { IGenericRepository } from './i-generic.repository';
import { PollQuestion } from '../entities/poll-question.entity';

export interface IPollQuestionRepository extends IGenericRepository<PollQuestion> {
  findByPoll(pollId: number): Promise<PollQuestion[]>;
  deleteByPoll(pollId: number): Promise<void>;
}

export const IPollQuestionRepository = Symbol('IPollQuestionRepository');

