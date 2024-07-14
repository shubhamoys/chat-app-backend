import { Schema } from 'mongoose';

export const PasswordSchema = new Schema({
  hash: {
    type: String,
    required: [true, 'MISSING_FIELD__hash'],
  },

  otp: {
    type: String,
  },

  reset: {
    type: Boolean,
    required: [true, 'MISSING_FIELD__reset'],
    default: false,
  },
});
