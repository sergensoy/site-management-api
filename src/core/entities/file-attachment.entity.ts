import { BaseEntity } from './base.entity';
import { File } from './file.entity';

export class FileAttachment extends BaseEntity {
  fileId!: number;
  file?: File;
  entityType!: string; // "Expense", "Site", "Unit", vb.
  entityId!: number;
  description?: string | null;
  // createdById BaseEntity'den geliyor, tekrar tanımlamaya gerek yok

  constructor(props?: Partial<FileAttachment>) {
    super(props);
    if (props) {
      Object.assign(this, props);
    }
  }
}

