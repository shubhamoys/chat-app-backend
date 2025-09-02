import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Get allowed origins from environment or use defaults
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3001', 'http://localhost:3000'];

    const origin = req.headers.origin;

    // Check if origin is allowed
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV === 'development'
    ) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  }
}
