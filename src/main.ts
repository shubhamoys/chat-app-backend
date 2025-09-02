import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppConfig } from './config/app.config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const appConfig = AppConfig.getInstance();
  const logger = new Logger('Bootstrap');

  // Security middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000'];

      if (
        allowedOrigins.includes(origin) ||
        appConfig.app.nodeEnv === 'development'
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // API prefix
  app.setGlobalPrefix('api/v1');

  const port = appConfig.app.port;
  const environment = appConfig.app.nodeEnv;

  await app.listen(port);

  logger.log(`🚀 Chat App Backend is running on port ${port}`);
  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`📡 API Base URL: http://localhost:${port}/api/v1`);
  logger.log(`💬 WebSocket URL: http://localhost:${port}/chat`);

  if (environment === 'development') {
    logger.log(
      `🔗 API Documentation might be available at: http://localhost:${port}/api/docs`,
    );
  }
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start the application', error);
  process.exit(1);
});
