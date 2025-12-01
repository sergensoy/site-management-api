import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IBlockRepository } from '../../core/repositories/i-block.repository';
import { PrismaBlockRepository } from '../../infrastructure/repositories/prisma-block.repository';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [BlockController],
  providers: [
    BlockService,
    PrismaService,
    { provide: IBlockRepository, useClass: PrismaBlockRepository },
    { provide: IUserRepository, useClass: PrismaUserRepository }, // Guard için gerekli
  ],
})
export class BlockModule {}