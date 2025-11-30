import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../core/repositories/i-user.repository';
import { ILoginAuditRepository } from '../../core/repositories/i-login-audit.repository';

@Injectable()
export class AuthService {
  constructor(
    // 👇 Dependency Injection: Somut sınıf yerine Interface sembolü kullanıyoruz
    @Inject(IUserRepository) private userRepository: IUserRepository,
    @Inject(ILoginAuditRepository) private loginAuditRepository: ILoginAuditRepository,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string, ip: string) {
    // 1. Kullanıcıyı Bul
    const user = await this.userRepository.findByEmail(email);

    // 2. Kullanıcı Yoksa?
    if (!user) {
      await this.loginAuditRepository.logAttempt(null, ip, 'FAILED', 'User not found');
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    // 3. Şifre Kontrolü
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      await this.loginAuditRepository.logAttempt(user.id, ip, 'FAILED', 'Wrong password');
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    // 4. Giriş Başarılı -> Logla
    await this.loginAuditRepository.logAttempt(user.id, ip, 'SUCCESS');

    // 5. Token Üret
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}