import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  // Increase JSON body size limit to accommodate file uploads
  app.use(json({ limit: '10mb' }));
  // Enable CORS so that the Angular dev server can call the backend
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(3000);
}

bootstrap().catch((err) => console.error(err));