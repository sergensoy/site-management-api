import { IGenericRepository } from './i-generic.repository';
import { File } from '../entities/file.entity';
import { FileCategory } from '../entities/file-category.enum';
import { FileStatus } from '../entities/file-status.enum';

export interface IFileRepository extends IGenericRepository<File> {
  findByCategory(category: FileCategory): Promise<File[]>;
  findByStatus(status: FileStatus): Promise<File[]>;
  findByMimeType(mimeType: string): Promise<File[]>;
  searchByOriginalName(searchTerm: string): Promise<File[]>;
  findByPath(path: string): Promise<File | null>;
}

export const IFileRepository = Symbol('IFileRepository');

