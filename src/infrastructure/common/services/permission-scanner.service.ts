import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { RESOURCE_DEFINITION_KEY, ResourceDefinition } from '../decorators/define-resource.decorator';

@Injectable()
export class PermissionScannerService implements OnModuleInit {
  private readonly logger = new Logger(PermissionScannerService.name);

  constructor(
    private readonly discoveryService: DiscoveryService, // NestJS modül ağacını tarar
    private readonly reflector: Reflector, // Metadata okur
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.scanAndSyncPermissions();
  }

  private async scanAndSyncPermissions() {
    this.logger.log('🔍 Controllerlar taranıyor ve izinler oluşturuluyor...');

    // 1. Uygulamadaki TÜM Controller'ları bul
    const controllers = this.discoveryService.getControllers();

    // 2. Standart CRUD Şablonu
    const crudActions = [
      { suffix: 'view', desc: 'görüntüleme' },
      { suffix: 'create', desc: 'oluşturma' },
      { suffix: 'update', desc: 'güncelleme' },
      { suffix: 'delete', desc: 'silme' },
    ];

    let newPermissionsCount = 0;

    for (const wrapper of controllers) {
      const { instance } = wrapper;
      // Instance yoksa veya Controller değilse atla
      if (!instance || typeof instance !== 'object') continue;

      // 3. Controller sınıfının üzerindeki @DefineResource metadata'sını oku
      const resourceDef = this.reflector.get<ResourceDefinition>(
        RESOURCE_DEFINITION_KEY,
        instance.constructor,
      );

      // Eğer bu Controller bir Kaynak olarak işaretlenmişse:
      if (resourceDef) {
        const { key, name } = resourceDef; // Örn: key='users', name='Kullanıcı'

        // 4. Bu kaynak için 4 temel CRUD iznini oluştur
        for (const action of crudActions) {
          const slug = `${key}.${action.suffix}`; // users.create
          const description = `${name} ${action.desc}`; // Kullanıcı oluşturma
          const moduleName = key.toUpperCase();

          // Veritabanına Yaz (Upsert)
          const perm = await this.prisma.permission.upsert({
            where: { slug },
            update: { description, module: moduleName },
            create: { slug, description, module: moduleName },
          });
          
          // (İsteğe bağlı: Burada Admin'e otomatik atama mantığını da çağırabilirsiniz)
        }
        newPermissionsCount += 4;
      }
    }

    this.logger.log(`✅ Tarama tamamlandı. Kaynaklar senkronize edildi.`);
  }
}