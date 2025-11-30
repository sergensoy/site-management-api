import { BaseEntity } from './base.entity';

export class User extends BaseEntity {
  email!: string;
  passwordHash!: string;
  firstName!: string;
  lastName!: string;
  phoneNumber?: string | null;
  
  isActive!: boolean;
  roleId?: number | null;

  constructor(props?: Partial<User>) {
    super(props);
    if (props) {
      Object.assign(this, props);
    }
  }

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public canLogin(): boolean {
    return this.isActive && !this.isDeleted();
  }
}