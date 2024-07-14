import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Email } from '../email/email';
import { Password } from '../password/password';
import { Token } from 'src/app-modules/tokens/models/token/token';

export class User extends Document {
  userId: string;

  name: string;

  email: Email;

  password: Password;

  role: string;

  tokens?: Token[];

  timestamp: { createdAt: number; updatedAt: number };

  static async hashPassword(plainPassword: string) {
    return await bcrypt.hash(plainPassword, 10);
  }

  static async comparePassword(toCompare: string, hashed: string) {
    return await bcrypt.compare(toCompare, hashed);
  }
}
