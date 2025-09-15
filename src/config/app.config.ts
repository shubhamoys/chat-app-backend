import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfig {
  private static instance: AppConfig;

  public readonly database = {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app',
  };

  public readonly jwt = {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };

  public readonly smtp = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  };

  public readonly email = {
    from: process.env.FROM_EMAIL || '',
    fromName: process.env.FROM_NAME || 'Chat App',
  };

  public readonly otp = {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10'),
  };

  public readonly app = {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  };

  constructor() {
    if (AppConfig.instance) {
      return AppConfig.instance;
    }
    AppConfig.instance = this;
  }

  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }
}
