import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3200', 'http://localhost:3201'],
    credentials: false,
  });

  app.setGlobalPrefix('api');
  await app.listen(3001);
}
bootstrap();