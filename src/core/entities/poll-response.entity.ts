import { BaseEntity } from './base.entity';

export class PollResponse extends BaseEntity {
  pollId!: number;
  userId!: number;

  constructor(props?: Partial<PollResponse>) {
    super(props);
    if (props) {
      Object.assign(this, props);
    }
  }
}

