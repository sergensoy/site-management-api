import { BaseEntity } from './base.entity';

export class Unit extends BaseEntity {
  unitNumber!: string;
  floor?: number | null;
  shareOfLand?: number | null; // Prisma Decimal, Domain'de number olur
  blockId!: number;

  constructor(props?: Partial<Unit>) {
    super(props);
    if (props) {
      this.unitNumber = props.unitNumber!;
      this.floor = props.floor;
      this.blockId = props.blockId!;
      this.shareOfLand = props.shareOfLand ? Number(props.shareOfLand) : null;
    }
  }
}