import { BaseEntity } from './base.entity';

export class Permission extends BaseEntity {
  slug: string;        // Örn: 'site.create'
  description?: string | null;
  module: string;      // Örn: 'SITE_MANAGEMENT'

  constructor(props?: Partial<Permission>) {
    super(props);
    if (props) {
      this.slug = props.slug!;
      this.description = props.description;
      this.module = props.module!;
    }
  }
}