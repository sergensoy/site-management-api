import { BaseEntity } from './base.entity';

export class PollOption extends BaseEntity {
  questionId!: number;
  optionText!: string;
  order!: number;

  constructor(props?: Partial<PollOption>) {
    super(props);
    if (props) {
      Object.assign(this, props);
    }
  }
}

