import { BaseEntity } from './base.entity';

export enum ExpenseType {
  OPERATIONAL = 'OPERATIONAL',
  CAPITAL = 'CAPITAL',
}

export enum TransactionStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
}

export class Expense extends BaseEntity {
  siteId!: number;
  amount!: number;
  description!: string;
  date!: Date;
  type!: ExpenseType;
  status!: TransactionStatus;

  constructor(props?: Partial<Expense>) {
    super(props);
    if (props) {
      this.siteId = props.siteId!;
      this.amount = props.amount ? Number(props.amount) : 0;
      this.description = props.description!;
      this.date = props.date!;
      this.type = props.type || ExpenseType.OPERATIONAL;
      this.status = props.status || TransactionStatus.CONFIRMED;
    }
  }
}

