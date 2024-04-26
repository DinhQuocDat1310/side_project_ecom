import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 10000
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:4000','https://javis-f3q7.onrender.com', process.env.FRONT_DEPLOY], // Allow requests from this origin
    credentials: true, // Allow sending cookies or authentication headers
  });

    await app.listen(port); // Use port 8000 if process.env.PORT is not defined
}
bootstrap();
