import { BaseEntity } from './base.entity';

export class Block extends BaseEntity {
  name!: string;
  siteId!: number;

  constructor(props?: Partial<Block>) {
    super(props);
    if (props) {
      this.name = props.name!;
      this.siteId = props.siteId!;
    }
  }
}