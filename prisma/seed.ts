// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clean Architecture Tohumlama Başladı...');

  // 1. YETKİLERİ OLUŞTUR (PERMISSIONS)
  // Sistemin çalışması için gerekli temel yetkiler
  const permissionsData = [
    { slug: 'rbac.manage_roles', description: 'Rolleri yönetme ve yetki atama', module: 'RBAC' },
    // İleride eklenecek diğer modüller için yer tutucular
    { slug: 'users.manage', description: 'Kullanıcı yönetimi', module: 'USERS' },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        description: p.description,
        module: p.module,
      },
    });
  }
  console.log('✅ Yetkiler oluşturuldu.');

  // 2. ROLLERİ OLUŞTUR
  const adminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Tam yetkili yönetici',
      isSystem: true,
    },
  });

  console.log('✅ Roller oluşturuldu.');

  // 3. YETKİLERİ ADMİN'E ATA
  // Veritabanındaki tüm yetkileri çekip Admin'e bağlıyoruz
  const allPermissions = await prisma.permission.findMany();
  
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }
  console.log(`✅ Admin rolüne ${allPermissions.length} adet yetki atandı.`);

  // 4. KULLANICI OLUŞTUR
  const passwordHash = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@site.com' },
    update: {
      roleId: adminRole.id, // Rolü güncelle (eğer değiştiyse)
    },
    create: {
      email: 'admin@site.com',
      passwordHash,
      firstName: 'Sistem',
      lastName: 'Admin',
      isActive: true,
      roleId: adminRole.id,
    },
  });

  console.log(`✅ Admin kullanıcısı hazır: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });