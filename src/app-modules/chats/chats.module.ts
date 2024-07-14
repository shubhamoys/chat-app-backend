import { forwardRef, Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './schemas/chat.schema/chat.schema';
import { SharedModule } from 'src/shared/shared.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: 'Chats',
        useFactory: () => {
          ChatSchema.index({ name: 'text' });

          ChatSchema.set('toJSON', {
            getters: true,
            transform: (doc, ret, options) => {
              ret.crewId = ret._id;
              delete ret._id;
              delete ret.id;
              delete ret.__v;
            },
          });

          return ChatSchema;
        },
      },
    ]),

    forwardRef(() => SharedModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
