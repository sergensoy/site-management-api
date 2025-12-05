import { BaseEntity } from './base.entity';
import { PollQuestionType } from './poll-question-type.enum';

export class PollQuestion extends BaseEntity {
  pollId!: number;
  questionText!: string;
  questionType!: PollQuestionType;
  order!: number;
  isRequired!: boolean;

  constructor(props?: Partial<PollQuestion>) {
    super(props);
    if (props) {
      Object.assign(this, props);
    }
  }
}

