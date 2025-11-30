import { Body, Controller, Post, HttpCode, HttpStatus, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: LoginDto, @Ip() ip: string) {
    return this.authService.signIn(signInDto.email, signInDto.password, ip);
  }
}