import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfiguration from './config/db.configuration';
import appConfiguration from './config/app.configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './shared/shared.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GenericExceptionFilter } from './shared/filters/generic-exception/generic-exception.filter';
import { HttpExceptionFilter } from './shared/filters/http-exception/http-exception.filter';
import { PermissionsModule } from './app-modules/permissions/permissions.module';
import { UsersModule } from './app-modules/users/users.module';
import { TokensModule } from './app-modules/tokens/tokens.module';
import { TokenGuard } from './shared/guards/token/token.guard';
import { PermissionGuard } from './shared/guards/permission/permission.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfiguration, dbConfiguration],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          'mongodb://' +
          configService.get<string>('db.host') +
          ':' +
          configService.get<string>('db.port') +
          '/' +
          configService.get<string>('db.name'),
      }),
      inject: [ConfigService],
    }),

    SharedModule,
    PermissionsModule,
    UsersModule,
    TokensModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GenericExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    {
      provide: APP_GUARD,
      useClass: TokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
