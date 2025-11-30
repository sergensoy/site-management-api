import { Module } from '@nestjs/common';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ISiteRepository } from '../../core/repositories/i-site.repository';
import { PrismaSiteRepository } from '../../infrastructure/repositories/prisma-site.repository';
import { IUserRepository } from '../../core/repositories/i-user.repository'; // Guard için lazım
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [SiteController],
  providers: [
    SiteService,
    PrismaService,
    { provide: ISiteRepository, useClass: PrismaSiteRepository },
    // Guard'ın çalışması için IUserRepository'yi de provide etmeliyiz
    { provide: IUserRepository, useClass: PrismaUserRepository }, 
  ],
})
export class SiteModule {}