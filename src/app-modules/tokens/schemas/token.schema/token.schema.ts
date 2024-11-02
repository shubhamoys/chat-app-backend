import { Schema } from 'mongoose';

export const TokenSchema = new Schema({
  __v: { type: Number, select: false },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'MISSING_FIELD__userId'],
  },

  name: {
    type: String,
    required: [true, 'MISSING_FIELD__name'],
  },

  hash: {
    type: String,
    required: [true, 'MISSING_FIELD__hash'],
  },

  expiry: {
    type: Number,
    required: [true, 'MISSING_FIELD__expiry'],
    validate: {
      // validates the expiry
      validator: (expiry: any) => {
        expiry = parseFloat(expiry); // this parses "Infinity" to Infinity - JS constant

        // expiry should either be 0 for nonce type or greater than the current timestamp
        return expiry === 0 || expiry > new Date().getTime();
      },
      message: 'INVALID_FIELD__expiry',
    },
  },

  description: {
    type: String,
    default: null,
  },

  disabled: {
    type: Boolean,
    required: [true, 'MISSING_FIELD__disabled'],
    default: false,
  },

  timestamp: {
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
  },
});
