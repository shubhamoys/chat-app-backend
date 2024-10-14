import { IRole } from './interfaces';

export class Roles {
  public static readonly SUPER_ADMIN: IRole = {
    role: 'SUPER_ADMIN',
    description: 'Super Admin users',
    childRoles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    visible: true,
  };

  public static readonly ADMIN: IRole = {
    role: 'ADMIN',
    description: 'Admin users',
    childRoles: ['ADMIN', 'USER'],
    visible: true,
  };

  public static readonly USER: IRole = {
    role: 'USER',
    description: 'Other users',
    childRoles: ['USER'],
    visible: true,
  };
}
