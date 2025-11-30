import { Injectable } from '@nestjs/common';
import { ILoginAuditRepository } from '../../core/repositories/i-login-audit.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaLoginAuditRepository implements ILoginAuditRepository {
  constructor(private prisma: PrismaService) {}

  async logAttempt(userId: number | null, ip: string, status: 'SUCCESS' | 'FAILED', reason?: string): Promise<void> {
    await this.prisma.loginAudit.create({
      data: {
        userId,
        ipAddress: ip,
        status,
        failureReason: reason,
        // UserAgent vb. eklenebilir
      },
    });
  }
}