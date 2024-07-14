import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './app-modules/users/users.module';
import { TokensModule } from './app-modules/tokens/tokens.module';
import { PermissionsModule } from './app-modules/permissions/permissions.module';
import appConfiguration from './config/app.configuration';
import dbConfiguration from './config/db.configuration';
import { GenericExceptionFilter } from './shared/filters/generic-exception/generic-exception.filter';
import { HttpExceptionFilter } from './shared/filters/http-exception/http-exception.filter';
import { TokenGuard } from './shared/guards/token/token.guard';
import { PermissionGuard } from './shared/guards/permission/permission.guard';
import { ChatsModule } from './app-modules/chats/chats.module';
import { MessagesModule } from './app-modules/messages/messages.module';
import { SeederModule } from './app-modules/seeder/seeder.module';

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

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport:
          'smtps://' +
          configService.get<string>('app.email.user') +
          ':' +
          configService.get<string>('app.email.pass') +
          '@smtp.gmail.com',
        defaults: {
          from: configService.get<string>('app.email.from'),
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    SharedModule,

    UsersModule,

    TokensModule,

    PermissionsModule,

    SeederModule,

    ChatsModule,

    MessagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: GenericExceptionFilter,
    // },
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: TokenGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionGuard,
    // },
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly configService: ConfigService) {
    this.logAppConfig();
  }

  private logAppConfig() {
    const appConfig = this.configService;
    if (appConfig) {
      this.logger.log('Application Configuration:');
      console.log(appConfig);
    } else {
      this.logger.error('Failed to load application configuration.');
    }
  }
}
