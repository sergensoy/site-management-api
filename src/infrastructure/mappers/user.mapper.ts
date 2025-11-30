import { User as PrismaUser } from '@prisma/client';
import { User } from '../../core/entities/user.entity';

export class UserMapper {
  // Veritabanından (Prisma) -> Domain'e (Entity)
  static toDomain(raw: PrismaUser): User {
    return new User({
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      firstName: raw.firstName,
      lastName: raw.lastName,
      phoneNumber: raw.phoneNumber,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  // Domain'den (Entity) -> Veritabanına (Prisma)
  // (Kaydetme işlemleri için gerekirse kullanılır)
  static toPersistence(user: User): Partial<PrismaUser> {
    return {
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
    };
  }
}