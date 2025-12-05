import { BaseEntity } from './base.entity';

export class PollResponseAnswer extends BaseEntity {
  responseId!: number;
  questionId!: number;
  answerText?: string | null;
  answerNumber?: number | null;
  answerDate?: Date | null;
  selectedOptionIds?: number[] | null;

  constructor(props?: Partial<PollResponseAnswer>) {
    super(props);
    if (props) {
      Object.assign(this, props);
    }
  }
}

