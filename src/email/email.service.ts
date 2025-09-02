import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../config/app.config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly appConfig: AppConfig;

  constructor() {
    this.appConfig = AppConfig.getInstance();
    this.transporter = nodemailer.createTransport({
      host: this.appConfig.smtp.host,
      port: this.appConfig.smtp.port,
      secure: this.appConfig.smtp.secure,
      auth: {
        user: this.appConfig.smtp.user,
        pass: this.appConfig.smtp.pass,
      },
    });
  }

  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${this.appConfig.email.fromName}" <${this.appConfig.email.from}>`,
        to: email,
        subject: 'Email Verification - Chat App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Email Verification</h1>
            <p style="color: #666; font-size: 16px;">
              Thank you for registering with Chat App! To complete your registration, 
              please use the following verification code:
            </p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h2 style="color: #333; font-size: 32px; letter-spacing: 3px; margin: 0;">
                ${otp}
              </h2>
            </div>
            <p style="color: #666; font-size: 14px;">
              This code will expire in ${this.appConfig.otp.expiryMinutes} minutes.
            </p>
            <p style="color: #666; font-size: 14px;">
              If you didn't create an account with Chat App, please ignore this email.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error.stack,
      );
      throw new Error('Failed to send verification email');
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
