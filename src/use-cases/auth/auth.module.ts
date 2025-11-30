// src/use-cases/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// Interface & Implementations
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { ILoginAuditRepository } from '../../core/repositories/i-login-audit.repository';
import { PrismaLoginAuditRepository } from '../../infrastructure/repositories/prisma-login-audit.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: 'SUPER_GIZLI_SECRET_KEY', // .env'den alınmalı
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService, // Repository'ler buna ihtiyaç duyar
    
    // 👇 DEPENDENCY INJECTION MAGIC 
    {
      provide: IUserRepository,      // Interface (Soyut)
      useClass: PrismaUserRepository // Implementation (Somut)
    },
    {
      provide: ILoginAuditRepository,
      useClass: PrismaLoginAuditRepository
    }
  ],
})
export class AuthModule {}