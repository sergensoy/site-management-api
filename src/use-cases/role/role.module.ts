import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

// Interface & Implementation
import { IRoleRepository } from '../../core/repositories/i-role.repository';
import { PrismaRoleRepository } from '../../infrastructure/repositories/prisma-role.repository';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [RoleController],
  providers: [
    RoleService,
    PrismaService,
    // 👇 Rol Repository Bağlantısı
    {
      provide: IRoleRepository,
      useClass: PrismaRoleRepository,
    },
    // 👇 Permission Guard içinde IUserRepository kullanıldığı için bunu da sağlamalıyız
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
  ],
})
export class RoleModule {}