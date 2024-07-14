import { forwardRef, Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from './schemas/message.schema/message.schema';
import { SharedModule } from 'src/shared/shared.module';
import { UsersModule } from '../users/users.module';
import { MessagesService } from './messages.service';
import { ChatsModule } from '../chats/chats.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: 'Messages',
        useFactory: () => {
          MessageSchema.index({ content: 'text' });

          MessageSchema.set('toJSON', {
            getters: true,
            transform: (doc, ret, options) => {
              ret.crewId = ret._id;
              delete ret._id;
              delete ret.id;
              delete ret.__v;
            },
          });

          return MessageSchema;
        },
      },
    ]),

    forwardRef(() => SharedModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ChatsModule),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
