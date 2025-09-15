import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: false,
})
export class User extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: null })
  displayPicture: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  friends: Types.ObjectId[];

  @Prop({ default: Date.now })
  lastActive: Date;

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

export const UserSchema = SchemaFactory.createForClass(User);
