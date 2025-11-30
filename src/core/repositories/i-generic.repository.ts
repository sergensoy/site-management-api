export interface IGenericRepository<T> {
  create(item: T): Promise<T>;
  update(id: number, item: Partial<T>): Promise<T>;
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  delete(id: number, deletedById?: number): Promise<void>;
}