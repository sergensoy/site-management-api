import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Token'ı Header'dan "Bearer <token>" olarak oku
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // DİKKAT: AuthModule'deki secret ile AYNI olmalı
      secretOrKey: 'SUPER_GIZLI_SECRET_KEY', 
    });
  }

  // Token geçerliyse bu fonksiyon çalışır ve return değeri `req.user` olur
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}