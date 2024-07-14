import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppResponseInterceptor } from './shared/interceptors/app-response/app-response.interceptor';

async function bootstrap() {
  console.log('0');

  const app = await NestFactory.create(AppModule);

  // console.log(app);

  console.log('1');

  app.use(helmet());

  console.log('2');

  app.enableCors();

  console.log('3');

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new AppResponseInterceptor());

  console.log('4');

  let configService = app.get(ConfigService);

  console.log(configService);

  console.log(configService.get('app.port'));

  await app.listen(configService.get('app.port'));
}

bootstrap();
