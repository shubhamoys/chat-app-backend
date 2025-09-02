import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from '../config/app.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const appConfig = AppConfig.getInstance();
        return {
          uri: appConfig.database.uri,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
