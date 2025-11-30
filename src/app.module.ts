import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { PermissionScannerService } from './infrastructure/common/services/permission-scanner.service';
import { AuthModule } from './use-cases/auth/auth.module';
import { RoleModule } from './use-cases/role/role.module';
import { SiteModule } from './use-cases/site/site.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { PermissionInitService } from './infrastructure/common/services/permission-init.service';

@Module({
  imports: [
    DiscoveryModule,
    AuthModule,
    RoleModule,
    SiteModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [
    PermissionScannerService,
    PermissionInitService,
  ],
})
export class AppModule {}
