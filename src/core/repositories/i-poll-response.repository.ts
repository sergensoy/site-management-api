import { IGenericRepository } from './i-generic.repository';
import { PollResponse } from '../entities/poll-response.entity';

export interface IPollResponseRepository extends IGenericRepository<PollResponse> {
  findByPoll(pollId: number): Promise<PollResponse[]>;
  findByUser(userId: number): Promise<PollResponse[]>;
  findByPollAndUser(pollId: number, userId: number): Promise<PollResponse | null>;
  getResponseCount(pollId: number): Promise<number>;
}

export const IPollResponseRepository = Symbol('IPollResponseRepository');

