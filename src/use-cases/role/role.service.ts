import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../../core/repositories/i-role.repository';
import { Role } from '../../core/entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @Inject(IRoleRepository) private roleRepository: IRoleRepository
  ) {}

  async createRole(name: string, description?: string) {
    const existing = await this.roleRepository.findByName(name);
    if (existing) throw new BadRequestException('Bu isimde bir rol zaten var.');

    const newRole = new Role({ name, description });
    return this.roleRepository.create(newRole);
  }

  async updateRolePermissions(roleId: number, permissionIds: number[]) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundException('Rol bulunamadı.');
    
    if (role.isSystem) {
        // Opsiyonel: Sistem rollerinin (Admin) yetkileri değişmesin isterseniz burayı açın.
        // throw new BadRequestException('Sistem rollerinin yetkileri değiştirilemez.');
    }

    await this.roleRepository.assignPermissions(roleId, permissionIds);
    return { message: 'Yetkiler güncellendi.' };
  }

  async findAll() {
    return this.roleRepository.findAll();
  }
}