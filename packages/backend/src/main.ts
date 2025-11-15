import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const frontend = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  app.enableCors({ origin: frontend, credentials: true });
  await app.listen(4000);
}
bootstrap();
