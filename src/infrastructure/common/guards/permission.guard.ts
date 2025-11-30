import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { IUserRepository } from '../../../core/repositories/i-user.repository';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    // Kullanıcının güncel yetkilerini çekmek için Repository'yi kullanıyoruz
    @Inject(IUserRepository) private userRepository: IUserRepository, 
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true; // Yetki gerekmiyorsa geç
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.id) return false;

    // Kullanıcının veritabanındaki güncel rolünü ve yetkilerini çekiyoruz
    // Not: JWT payload'daki bilgi eski olabilir, veritabanından çekmek en güvenlisidir.
    const userWithRole = await this.userRepository.findByIdWithPermissions(user.id);
    
    if (!userWithRole || !userWithRole.role) return false;

    // Kullanıcının sahip olduğu yetki slug'ları
    const userPermissions = userWithRole.role.permissions.map(p => p.slug);

    // Gerekli yetkilerden EN AZ BİRİNE sahip mi?
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  }
}