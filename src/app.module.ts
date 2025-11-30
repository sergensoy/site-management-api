import { Module } from '@nestjs/common';
import { AuthModule } from './use-cases/auth/auth.module';
import { RoleModule } from './use-cases/role/role.module';

@Module({
  imports: [
    AuthModule,
    RoleModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
