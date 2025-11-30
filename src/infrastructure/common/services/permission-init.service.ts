// src/infrastructure/common/services/permission-init.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS } from '../../../core/constants/permissions';

@Injectable()
export class PermissionInitService implements OnModuleInit {
  private readonly logger = new Logger(PermissionInitService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.syncPermissions();
  }

  private async syncPermissions() {
    this.logger.log('🔄 Yetkiler veritabanı ile eşitleniyor...');

    // 1. Admin Rolünü Bul (Yoksa seed ile oluşturulmalıydı ama garanti olsun)
    const adminRole = await this.prisma.role.findUnique({
      where: { name: 'Super Admin' },
    });

    if (!adminRole) {
      this.logger.warn('⚠️ Super Admin rolü bulunamadı, yetki ataması atlanıyor.');
      return;
    }

    let newCount = 0;

    for (const perm of PERMISSIONS) {
      // Upsert: Varsa güncelle (açıklama değişmiş olabilir), yoksa oluştur
      const permission = await this.prisma.permission.upsert({
        where: { slug: perm.slug },
        update: {
          description: perm.description,
          module: perm.module,
        },
        create: {
          slug: perm.slug,
          description: perm.description,
          module: perm.module,
        },
      });

      // 2. Admin'e Otomatik Ata (Eğer atanmamışsa)
      const rolePermissionExists = await this.prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
      });

      if (!rolePermissionExists) {
        await this.prisma.rolePermission.create({
          data: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        });
        newCount++;
      }
    }

    if (newCount > 0) {
      this.logger.log(`✅ ${newCount} yeni yetki sisteme eklendi ve Admin'e atandı.`);
    } else {
      this.logger.log('✨ Özel yetkiler (Custom Permissions) güncel.');
    }
  }
}