import { Schema } from 'mongoose';

export const ChatSchema = new Schema({
  __v: { type: Number, select: false },

  participantIds: {
    type: [Schema.Types.ObjectId],
    ref: 'Users',
    required: [true, 'MISSING_FIELD__userId'],
    validate: {
      validator: function (value) {
        return value.length === 2;
      },
      message: 'Chat must have exactly two participants.',
    },
  },

  timestamp: {
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
  },
});
