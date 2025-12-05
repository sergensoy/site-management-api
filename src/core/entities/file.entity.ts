import { BaseEntity } from './base.entity';
import { FileCategory } from './file-category.enum';
import { FileStatus } from './file-status.enum';
import { StorageType } from './storage-type.enum';

export class File extends BaseEntity {
  originalName!: string;
  storedName!: string;
  path!: string;
  mimeType!: string;
  size!: bigint;
  category!: FileCategory;
  storageType!: StorageType;
  status!: FileStatus;

  constructor(props?: Partial<File>) {
    super(props);
    if (props) {
      Object.assign(this, props);
    }
  }
}

