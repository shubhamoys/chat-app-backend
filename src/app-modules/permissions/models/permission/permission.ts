import { Document } from 'mongoose';
import { PermissionRestrictionEnum } from 'src/constants/enum';

export class Permission extends Document {
  userId: string;

  resourceId: string;

  resourceName: string;

  resourceAction: string;

  restriction: keyof typeof PermissionRestrictionEnum;

  timestamp: { createdAt: number; updatedAt: number };
}
