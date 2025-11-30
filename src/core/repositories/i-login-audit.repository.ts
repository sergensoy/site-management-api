export interface ILoginAuditRepository {
  logAttempt(userId: number | null, ip: string, status: 'SUCCESS' | 'FAILED', reason?: string): Promise<void>;
}

export const ILoginAuditRepository = Symbol('ILoginAuditRepository');