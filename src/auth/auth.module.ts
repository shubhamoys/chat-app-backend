import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AppConfig } from '../config/app.config';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async () => {
        const appConfig = AppConfig.getInstance();
        return {
          secret: appConfig.jwt.secret,
          signOptions: {
            expiresIn: appConfig.jwt.expiresIn,
          },
        };
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
