import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SharedModule } from 'src/shared/shared.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TokensModule } from '../tokens/tokens.module';
import { TokensService } from '../tokens/tokens.service';
import { UserSchema } from './schemas/user.schema/user.schema';
import { User } from './models/user/user';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    forwardRef(() =>
      MongooseModule.forFeatureAsync([
        {
          name: 'Users',

          imports: [TokensModule],
          useFactory: async (tokensService: TokensService) => {
            UserSchema.index({ 'email.value': 1 }, { unique: true });

            // defining text indexes
            UserSchema.index({
              name: 'text',
              bio: 'text',
            });

            UserSchema.set('toJSON', {
              virtuals: true,
              getters: true,
              transform: (doc, ret, options) => {
                ret.userId = ret._id;
                delete ret._id;
                delete ret.id;
                delete ret.__v;
                delete ret.password;

                if (ret.email) {
                  delete ret.email.otp;
                }
              },
            });

            UserSchema.set('toObject', {
              virtuals: true,
            });

            UserSchema.virtual('tokens', {
              ref: 'Tokens',
              localField: '_id',
              foreignField: 'userId',
              justOne: false,
            });

            // UserSchema.post<User>('save', async function () {
            //   if (!this.wasNew) {
            //     return this;
            //   }

            //   const token = await tokensService.create({
            //     userId: this._id,
            //     name: 'DEFAULT_TOKEN',
            //     expiry: Infinity,
            //     description: 'default token generated by system',
            //   });

            //   this.tokens = [token];

            //   return this;
            // });

            UserSchema.post<User>('findOneAndDelete', async (user) => {
              await tokensService.deleteBy({ userId: user['_id'] });

              return null;
            });

            return UserSchema;
          },
          inject: [forwardRef(() => TokensService)],
        },
      ]),
    ),
    forwardRef(() => PermissionsModule),
    forwardRef(() => TokensModule),
    forwardRef(() => SharedModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
