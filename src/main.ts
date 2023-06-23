import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Agregamos el prfijo a la URL
  app.setGlobalPrefix('api/v2');

  //validaciones globales
  app.useGlobalPipes( 
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
   );

  await app.listen(3000);
}
bootstrap();
