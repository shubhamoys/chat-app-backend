import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  __v: { type: Number, select: false },

  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'MISSING_FIELD__senderId'],
  },

  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'MISSING_FIELD__receiverId'],
  },

  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chats',
    required: [true, 'MISSING_FIELD__chatId'],
  },

  content: {
    type: String,
    required: [true, 'MISSING_FIELD__content'],
  },

  timestamp: {
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
  },
});
