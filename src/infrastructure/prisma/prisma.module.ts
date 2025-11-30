import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 👈 Bu modülü global yapar, her yerde tekrar tekrar import etmeye gerek kalmaz
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 Servisi dışarı açıyoruz
})
export class PrismaModule {}