import { Schema } from 'mongoose';

export const EmailSchema = new Schema({
  value: {
    type: String,
    required: [true, 'MISSING_FIELD__value'],
    validate: {
      validator: function (val: any) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
      },
      message: 'INVALID_FIELD__value',
    },
  },

  otp: {
    type: String,
    default: null,
  },

  verified: {
    type: Boolean,
    required: [true, 'MISSING_FIELD__verified'],
    default: false,
  },
});
