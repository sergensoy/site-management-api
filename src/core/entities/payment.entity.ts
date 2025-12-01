import { BaseEntity } from './base.entity';
import { TransactionStatus } from './expense.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
}

export class Payment extends BaseEntity {
  debtId!: number;
  amount!: number;
  paymentDate!: Date;
  paymentMethod!: string;
  status!: TransactionStatus;

  constructor(props?: Partial<Payment>) {
    super(props);
    if (props) {
      this.debtId = props.debtId!;
      this.amount = props.amount ? Number(props.amount) : 0;
      this.paymentDate = props.paymentDate || new Date();
      this.paymentMethod = props.paymentMethod!;
      this.status = props.status || TransactionStatus.CONFIRMED;
    }
  }
}

