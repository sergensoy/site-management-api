import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { User } from '../../core/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import * as bcrypt from 'bcrypt';
import { UserCreatedEvent } from '../../core/events/user-created.event';

@Injectable()
export class UserService {
  constructor(
    @Inject(IUserRepository) private userRepository: IUserRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateUserDto, userId: number): Promise<User> {
    // Email kontrolü
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor.');
    }

    // Şifreyi hash'le
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const newUser = new User({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      roleId: dto.roleId,
      isActive: true,
    });

    const createdUser = await this.userRepository.create(newUser);

    // Event emit et
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(
        createdUser.id,
        createdUser.email,
        createdUser.firstName,
        createdUser.lastName,
      ),
    );

    return createdUser;
  }

  async findAll(filterDto: FilterUserDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    let users: User[];
    let total: number;

    if (filterDto.search) {
      users = await this.userRepository.searchUsers(
        filterDto.search,
        filterDto.roleId,
        filterDto.isActive,
      );
      total = users.length;
      users = users.slice(skip, skip + limit);
    } else {
      const allUsers = await this.userRepository.findAll();
      total = allUsers.length;

      // Filtreleme
      let filteredUsers = allUsers;
      if (filterDto.roleId !== undefined) {
        filteredUsers = filteredUsers.filter(u => u.roleId === filterDto.roleId);
      }
      if (filterDto.isActive !== undefined) {
        filteredUsers = filteredUsers.filter(u => u.isActive === filterDto.isActive);
      }

      total = filteredUsers.length;
      users = filteredUsers.slice(skip, skip + limit);
    }

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto, userId: number): Promise<User> {
    await this.findOne(id); // Kullanıcının var olduğunu kontrol et

    // Email değişikliği kontrolü
    if (dto.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.');
      }
    }

    const updateData: Partial<User> = {
      ...dto,
      updatedById: userId,
    };

    // Password field'ını exclude et (ayrı endpoint var)
    delete (updateData as any).password;

    return this.userRepository.update(id, updateData);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id);
    return this.userRepository.delete(id);
  }

  async changePassword(id: number, dto: ChangePasswordDto, userId: number): Promise<void> {
    const user = await this.findOne(id);

    // Mevcut şifre kontrolü
    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mevcut şifre hatalı.');
    }

    // Yeni şifreyi hash'le ve güncelle
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(id, {
      passwordHash: newPasswordHash,
      updatedById: userId,
    });
  }

  async assignRole(id: number, dto: AssignRoleDto, userId: number): Promise<User> {
    await this.findOne(id);
    return this.userRepository.update(id, {
      roleId: dto.roleId,
      updatedById: userId,
    });
  }

  async activate(id: number, userId: number): Promise<User> {
    await this.findOne(id);
    return this.userRepository.update(id, {
      isActive: true,
      updatedById: userId,
    });
  }

  async deactivate(id: number, userId: number): Promise<User> {
    await this.findOne(id);
    return this.userRepository.update(id, {
      isActive: false,
      updatedById: userId,
    });
  }
}

