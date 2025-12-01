import { BaseEntity } from './base.entity';
import { ExpenseType, TransactionStatus } from './expense.entity';

export class Debt extends BaseEntity {
  payerId!: number;
  unitId!: number;
  amount!: number;
  description?: string | null;
  type!: ExpenseType;
  dueDate!: Date;
  isPaid!: boolean;
  status!: TransactionStatus;

  constructor(props?: Partial<Debt>) {
    super(props);
    if (props) {
      this.payerId = props.payerId!;
      this.unitId = props.unitId!;
      this.amount = props.amount ? Number(props.amount) : 0;
      this.description = props.description;
      this.type = props.type!;
      this.dueDate = props.dueDate!;
      this.isPaid = props.isPaid ?? false;
      this.status = props.status || TransactionStatus.CONFIRMED;
    }
  }
}

