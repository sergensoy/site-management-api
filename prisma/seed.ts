import { PrismaClient } from '@prisma/client';
import { seedNotificationTemplates } from './seed-templates';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  // Seed notification templates
  await seedNotificationTemplates();
  
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
