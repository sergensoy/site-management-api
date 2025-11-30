import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO'da olmayan fazlalık verileri otomatik temizler (Güvenlik için şart)
    transform: true, // Gelen verileri DTO sınıflarına dönüştürür
  }));

  await app.listen(3000);
}
bootstrap();
