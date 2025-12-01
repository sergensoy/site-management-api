import { Module } from '@nestjs/common';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IUnitRepository } from '../../core/repositories/i-unit.repository';
import { PrismaUnitRepository } from '../../infrastructure/repositories/prisma-unit.repository';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [UnitController],
  providers: [
    UnitService,
    PrismaService,
    { provide: IUnitRepository, useClass: PrismaUnitRepository },
    { provide: IUserRepository, useClass: PrismaUserRepository },
  ],
})
export class UnitModule {}