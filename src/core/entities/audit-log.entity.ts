import { BaseEntity } from './base.entity';

export class AuditLog extends BaseEntity {
  userId?: number | null;
  action!: string; // CREATE, UPDATE, DELETE
  resource!: string; // User, Site, Expense
  oldValue?: any | null;
  newValue?: any | null;

  constructor(props?: Partial<AuditLog>) {
    super(props);
    if (props) {
      this.userId = props.userId;
      this.action = props.action!;
      this.resource = props.resource!;
      this.oldValue = props.oldValue;
      this.newValue = props.newValue;
    }
  }
}

