import { Module, forwardRef } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionsService } from '../permissions/permissions.service';
import { TokenSchema } from './schemas/token.schema/token.schema';
import { Token } from './models/token/token';
import { UsersModule } from '../users/users.module';
import { SharedModule } from 'src/shared/shared.module';

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
  providers: [TokensService],
  controllers: [TokensController],
  exports: [TokensService],
})
export class TokensModule {}
