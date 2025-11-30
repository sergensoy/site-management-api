import { BaseEntity } from './base.entity';
import { Permission } from './permission.entity';

export class Role extends BaseEntity {
  name: string;
  description?: string | null;
  isSystem: boolean; // Admin gibi silinemez roller için
  
  // Domain İlişkisi: Bir rolün yetkileri listesi
  permissions: Permission[];

  constructor(props?: Partial<Role>) {
    super(props);
    if (props) {
      this.name = props.name!;
      this.description = props.description;
      this.isSystem = props.isSystem || false;
      this.permissions = props.permissions || [];
    }
  }
}