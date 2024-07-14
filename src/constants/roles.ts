import { IRole } from './interfaces';

export class Roles {
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
