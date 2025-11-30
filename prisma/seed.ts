// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Temiz Tohumlama (Seed) Başladı...');
  
  // 1. ROLLERİ OLUŞTUR
  // Sadece Rolleri oluşturuyoruz. İzinler (Permissions) uygulama başladığında Scanner tarafından oluşturulacak.
  const adminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Tam yetkili sistem yöneticisi',
      isSystem: true,
    },
  });

  await prisma.role.upsert({
    where: { name: 'Site Manager' },
    update: {},
    create: { name: 'Site Manager', isSystem: false },
  });
  
  await prisma.role.upsert({
    where: { name: 'Resident' },
    update: {},
    create: { name: 'Resident', isSystem: false },
  });

  console.log('✅ Roller hazırlandı.');

  // 2. SÜPER ADMİN KULLANICISINI OLUŞTUR
  const passwordHash = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@site.com' },
    update: { roleId: adminRole.id },
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
  console.log('🚀 Seed işlemi bitti. (İzinler uygulama başlatılınca otomatik yüklenecek)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });