import { BaseEntity } from './base.entity';

export enum ResidencyType {
  OWNER = 'OWNER',
  TENANT = 'TENANT',
}

export enum ResidencyStatus {
  ACTIVE = 'ACTIVE',
  MOVED_OUT = 'MOVED_OUT',
}

export class Residency extends BaseEntity {
  unitId!: number;
  userId!: number;
  type!: ResidencyType;
  status!: ResidencyStatus;
  moveInDate?: Date | null;
  moveOutDate?: Date | null;

  constructor(props?: Partial<Residency>) {
    super(props);
    if (props) {
      this.unitId = props.unitId!;
      this.userId = props.userId!;
      this.type = props.type!;
      this.status = props.status || ResidencyStatus.ACTIVE;
      this.moveInDate = props.moveInDate;
      this.moveOutDate = props.moveOutDate;
    }
  }
}

