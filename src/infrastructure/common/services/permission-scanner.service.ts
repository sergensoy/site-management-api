// src/infrastructure/common/services/permission-scanner.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { RESOURCE_DEFINITION_KEY, ResourceDefinition } from '../decorators/define-resource.decorator';

@Injectable()
export class PermissionScannerService implements OnModuleInit {
  private readonly logger = new Logger(PermissionScannerService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    // Uygulama ayağa kalktığında taramayı başlat
    await this.scanAndSyncPermissions();
  }

  private async scanAndSyncPermissions() {
    this.logger.log('🔍 Modüller taranıyor ve izinler senkronize ediliyor...');

    // 1. Admin Rolünü Bul (Bulamazsa uyarı ver)
    const adminRole = await this.prisma.role.findUnique({
      where: { name: 'Super Admin' },
    });

    if (!adminRole) {
      this.logger.warn('⚠️ Super Admin rolü bulunamadı. Otomatik atama yapılamayacak.');
    }

    const controllers = this.discoveryService.getControllers();
    
    const crudActions = [
      { suffix: 'view', desc: 'görüntüleme' },
      { suffix: 'create', desc: 'oluşturma' },
      { suffix: 'update', desc: 'güncelleme' },
      { suffix: 'delete', desc: 'silme' },
    ];

    let newPermissionsCount = 0;

    for (const wrapper of controllers) {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') continue;

      // Controller üzerindeki @DefineResource verisini oku
      const resourceDef = this.reflector.get<ResourceDefinition>(
        RESOURCE_DEFINITION_KEY,
        instance.constructor,
      );

      if (resourceDef) {
        const { key, name } = resourceDef; // Örn: key='site', name='Site'

        for (const action of crudActions) {
          const slug = `${key}.${action.suffix}`; // site.view
          const description = `${name} ${action.desc}`; // Site görüntüleme
          const moduleName = key.toUpperCase();

          // A. İzni Veritabanına Yaz (Upsert)
          const permission = await this.prisma.permission.upsert({
            where: { slug },
            update: { description, module: moduleName },
            create: { slug, description, module: moduleName },
          });

          // B. Admin Rolüne Ata (Eğer Admin varsa ve yetkisi yoksa)
          if (adminRole) {
            const exists = await this.prisma.rolePermission.findUnique({
              where: {
                roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id }
              }
            });

            if (!exists) {
              await this.prisma.rolePermission.create({
                data: { roleId: adminRole.id, permissionId: permission.id }
              });
              newPermissionsCount++;
            }
          }
        }
      }
    }

    if (newPermissionsCount > 0) {
      this.logger.log(`✅ Tarama bitti: ${newPermissionsCount} yeni CRUD izni oluşturuldu ve Admin'e atandı.`);
    } else {
      this.logger.log('✅ Tarama bitti: Tüm CRUD izinleri güncel.');
    }
  }
}