import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export enum VerificationTokenType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
}

export type VerificationTokenDocument = VerificationToken & Document;

@Schema({
  collection: 'verificationtokens',
  timestamps: false,
})
export class VerificationToken extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({
    type: String,
    enum: Object.values(VerificationTokenType),
    required: true,
  })
  type: VerificationTokenType;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({
    type: {
      createdAt: { type: Number, default: Date.now },
      updatedAt: { type: Number, default: Date.now },
    },
    default: () => ({
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  })
  timestamp: {
    createdAt: number;
    updatedAt: number;
  };
}

export const VerificationTokenSchema =
  SchemaFactory.createForClass(VerificationToken);
