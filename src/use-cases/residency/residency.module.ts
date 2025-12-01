import { Module } from '@nestjs/common';
import { ResidencyService } from './residency.service';
import { ResidencyController } from './residency.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IResidencyRepository } from '../../core/repositories/i-residency.repository';
import { PrismaResidencyRepository } from '../../infrastructure/repositories/prisma-residency.repository';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [ResidencyController],
  providers: [
    ResidencyService,
    PrismaService,
    { provide: IResidencyRepository, useClass: PrismaResidencyRepository },
    { provide: IUserRepository, useClass: PrismaUserRepository },
  ],
})
export class ResidencyModule {}

