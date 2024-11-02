import { forwardRef, Module } from '@nestjs/common';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { UsersModule } from '../users/users.module';
import { SharedModule } from 'src/shared/shared.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from './schemas/token.schema/token.schema';
import { PermissionsService } from '../permissions/permissions.service';
import { Token } from './models/token/token';

@Module({
  imports: [
    forwardRef(() =>
      MongooseModule.forFeatureAsync([
        {
          name: 'Tokens',
          imports: [PermissionsModule],
          useFactory: async (permissionsService: PermissionsService) => {
            TokenSchema.index({ hash: 1 }, { unique: true });
            TokenSchema.index({ name: 1, userId: 1 }, { unique: true });

            TokenSchema.set('toJSON', {
              virtuals: true,
              transform: (doc, ret, options) => {
                ret.tokenId = ret._id;
                delete ret._id;
                delete ret.id;
                delete ret.__v;

                ret.expiry = (Infinity && 'Infinity') || ret.expiry;
              },
            });

            TokenSchema.set('toObject', {
              virtuals: true,
            });

            // setup virtuals
            TokenSchema.virtual('permissions', {
              ref: 'Permissions',
              localField: '_id',
              foreignField: 'resourceId',
              justOne: false,
            });

            TokenSchema.post<Token>('findOneAndDelete', async (token) => {
              await permissionsService.deleteBy({
                resourceId: token['_id'],
              });

              return null;
            });

            return TokenSchema;
          },
          inject: [forwardRef(() => PermissionsService)],
        },
      ]),
    ),
    forwardRef(() => UsersModule),
    forwardRef(() => SharedModule),
    forwardRef(() => PermissionsModule),
  ],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
