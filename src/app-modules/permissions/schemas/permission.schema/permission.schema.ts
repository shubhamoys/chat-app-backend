import { Schema } from 'mongoose';
import { PermissionRestrictionEnum } from 'src/constants/enum';
import { ResourceConstant } from 'src/constants/resources';

export const PermissionSchema = new Schema({
  __v: { type: Number, select: false },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'MISSING_FIELD__userId'],
  },

  resourceId: {
    type: Schema.Types.ObjectId,
    refPath: 'resourceName',
    required: [true, 'MISSING_FIELD__resourceId'],
  },

  resourceName: {
    type: String,
    required: [true, 'MISSING_FIELD__resourceName'],
    enum: {
      values: ['Tokens'],
      message: 'INVALID_FIELD__resourceName',
    },
  },

  resourceAction: {
    type: String,
    required: [true, 'MISSING_FIELD__resourceAction'],
    enum: {
      values: Object.keys(ResourceConstant),
      message: 'INVALID_FIELD__resourceAction',
    },
  },

  restriction: {
    type: String,
    enum: {
      values: Object.keys(PermissionRestrictionEnum),
      message: 'INVALID_FIELD__restriction',
    },
  },

  timestamp: {
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
  },
});
