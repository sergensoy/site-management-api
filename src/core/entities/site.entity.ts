import { BaseEntity } from './base.entity';

export class Site extends BaseEntity {
  name!: string;
  address?: string | null;
  city?: string | null;
  defaultDues!: number; // Decimal yerine number kullanıyoruz (Domain'de)

  constructor(props?: Partial<Site>) {
    super(props);
    if (props) {
      this.name = props.name!;
      this.address = props.address;
      this.city = props.city;
      // Prisma Decimal gelir, bunu number'a çevirerek alacağız
      this.defaultDues = props.defaultDues ? Number(props.defaultDues) : 0;
    }
  }
}