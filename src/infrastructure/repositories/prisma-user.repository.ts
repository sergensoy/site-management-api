import { Injectable } from '@nestjs/common';
import { IUserRepository, UserWithRole } from '../../core/repositories/i-user.repository';
import { User } from '../../core/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from '../mappers/user.mapper';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);
    // Prisma create expects strict types, we might need specific casting or direct usage
    const savedUser = await this.prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      }
    });
    return UserMapper.toDomain(savedUser);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null } // Sadece silinmemişleri getir (Soft Delete kuralı)
    });
    return users.map((user) => UserMapper.toDomain(user));
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user || user.deletedAt) return null; // Silinmişse yok say
    return UserMapper.toDomain(user);
  }

  async findByIdWithPermissions(id: number): Promise<UserWithRole | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!user || user.deletedAt) return null;

    const domainUser = UserMapper.toDomain(user);
    // Role bilgisini de Domain objesine ekleyelim (Cast işlemi gerekebilir)
    const userWithRole = domainUser as UserWithRole;
    
    if (user.role) {
       userWithRole.role = RoleMapper.toDomain(user.role);
    }

    return userWithRole;
}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user || user.deletedAt) return null;
    return UserMapper.toDomain(user);
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    // Partial update mantığı
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...user,
        updatedAt: new Date(),
      },
    });
    return UserMapper.toDomain(updatedUser);
  }

  async delete(id: number): Promise<void> {
    // Hard Delete DEĞİL, Soft Delete yapıyoruz
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}