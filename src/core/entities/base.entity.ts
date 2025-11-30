export abstract class BaseEntity {
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;

  // İzlenebilirlik (Audit)
  createdById?: number | null;
  updatedById?: number | null;
  deletedById?: number | null;

  constructor(props?: Partial<BaseEntity>) {
    if (props) {
      // Tek tek atamak yerine Object.assign kullanmak
      // tip uyumsuzluklarını ve 'undefined' hatalarını çözer.
      Object.assign(this, props);
    }
  }

  public isDeleted(): boolean {
    return !!this.deletedAt;
  }
}