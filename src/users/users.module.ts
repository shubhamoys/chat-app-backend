import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import {
  VerificationToken,
  VerificationTokenSchema,
} from './schemas/verification-token.schema';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';

// Configure User Schema
const configureUserSchema = () => {
  // Security: Transform to exclude sensitive fields when converting to JSON
  UserSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
      delete ret.password;
      return ret;
    },
  });

  // Security: Transform to exclude sensitive fields when converting to Object
  UserSchema.set('toObject', {
    transform: function (doc: any, ret: any, options: any) {
      delete ret.password;
      return ret;
    },
  });

  // Create indexes (username and email already indexed via unique: true)
  UserSchema.index({ 'timestamp.createdAt': -1 });
  UserSchema.index({ lastActive: -1 });

  // Text index for search functionality
  UserSchema.index({
    username: 'text',
    name: 'text',
    email: 'text',
  });

  // Update timestamp on save
  UserSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
      this.timestamp.updatedAt = Date.now();
    }
    next();
  });

  UserSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
    this.set({ 'timestamp.updatedAt': Date.now() });
    next();
  });

  return UserSchema;
};

// Configure VerificationToken Schema
const configureVerificationTokenSchema = () => {
  // Create indexes
  VerificationTokenSchema.index({ userId: 1, type: 1 });
  VerificationTokenSchema.index({ token: 1 });
  VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  VerificationTokenSchema.index({ 'timestamp.createdAt': -1 });

  // Update timestamp on save
  VerificationTokenSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
      this.timestamp.updatedAt = Date.now();
    }
    next();
  });

  VerificationTokenSchema.pre(
    ['updateOne', 'findOneAndUpdate'],
    function (next) {
      this.set({ 'timestamp.updatedAt': Date.now() });
      next();
    },
  );

  return VerificationTokenSchema;
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: configureUserSchema() },
      {
        name: VerificationToken.name,
        schema: configureVerificationTokenSchema(),
      },
    ]),
    EmailModule,
    AuthModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
