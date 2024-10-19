import { IResource } from './interfaces';
import { Roles } from './roles';

export class ResourceConstant {
  //*****************************************************************//
  //************************* USERS ***************************//
  //*****************************************************************//

  /**
   * @description Resource that captures the request to get (*) users
   * @constant
   * @type {Object} GET_USERS
   * @default
   */
  public static readonly GET_USERS: IResource = {
    action: 'GET_USERS',
    resource: 'USERS',
    verb: 'GET',
    endpoint: '/users',
    signWith: 'TOKEN',
    type: 'READ',
    name: 'List All Users',
    description: 'Allows retrieving the list of all users',
    roles: {
      SUPER_ADMIN: {
        role: Roles.SUPER_ADMIN.role,
        restriction: '',
      },
      ADMIN: {
        role: Roles.ADMIN.role,
        restriction: '',
      },
      USER: {
        role: Roles.USER.role,
        restriction: 'userId',
      },
    },
  };

  /**
   * @description Resource that captures the request to add a new user by
   * creating a new entry in db
   * @constant
   * @type {Object} REGISTER_USERS
   * @default
   */
  public static readonly REGISTER_USERS: IResource = {
    action: 'REGISTER_USERS',
    resource: 'USERS',
    verb: 'POST',
    endpoint: '/users',
    signWith: '',
    type: 'WRITE',
    name: 'Add a new User',
    description: 'Allows to add a new user',
    roles: {
      SUPER_ADMIN: {
        role: Roles.SUPER_ADMIN.role,
        restriction: '',
      },
      ADMIN: {
        role: Roles.ADMIN.role,
        restriction: '',
      },
      USER: {
        role: Roles.USER.role,
        restriction: '',
      },
    },
  };

  /**
   * @description Resource that captures the request to update a user
   * @constant
   * @type {Object} UPDATE_USERS
   * @default
   */
  public static readonly UPDATE_USERS: IResource = {
    action: 'UPDATE_USERS',
    resource: 'USERS',
    verb: 'PUT',
    endpoint: '/users',
    signWith: 'TOKEN',
    type: 'WRITE',
    name: 'Update an existing User',
    description: 'Allows to update an existing user',
    roles: {
      SUPER_ADMIN: {
        role: Roles.SUPER_ADMIN.role,
        restriction: '',
      },
      ADMIN: {
        role: Roles.ADMIN.role,
        restriction: '',
      },
      USER: {
        role: Roles.USER.role,
        restriction: 'userId',
      },
    },
  };

  /**
   * @description Resource that captures the request to delete a user
   * @constant
   * @type {Object} DELETE_USERS
   * @default
   */
  public static readonly DELETE_USERS: IResource = {
    action: 'DELETE_USERS',
    resource: 'USERS',
    verb: 'DELETE',
    endpoint: '/users',
    signWith: 'TOKEN',
    type: 'WRITE',
    name: 'Delete an existing User',
    description: 'Allows to delete an existing user',
    roles: {
      SUPER_ADMIN: {
        role: Roles.SUPER_ADMIN.role,
        restriction: '',
      },
      ADMIN: {
        role: Roles.ADMIN.role,
        restriction: '',
      },
      USER: {
        role: Roles.USER.role,
        restriction: 'userId',
      },
    },
  };

  /**
   * @description Resource that captures the request to login an existing user with email by
   * validating an existing entry in db
   * @constant
   * @type {Object} LOGIN_USERS
   * @default
   */
  public static readonly LOGIN_USERS: IResource = {
    action: 'LOGIN_USERS',
    resource: 'USERS',
    verb: 'POST',
    endpoint: '/users/session/login',
    signWith: '',
    type: 'WRITE',
    name: 'Login an existing User with email',
    description: 'Allows to login an existing user with email',
    roles: {
      SUPER_ADMIN: {
        role: Roles.SUPER_ADMIN.role,
        restriction: '',
      },
      ADMIN: {
        role: Roles.ADMIN.role,
        restriction: '',
      },
      USER: {
        role: Roles.USER.role,
        restriction: '',
      },
    },
  };

  /**
   * @description Resource that captures the request to logout an existing user with email by
   * validating an existing entry in db
   * @constant
   * @type {Object} LOGOUT_USERS
   * @default
   */
  public static readonly LOGOUT_USERS: IResource = {
    action: 'LOGOUT_USERS',
    resource: 'USERS',
    verb: 'POST',
    endpoint: '/users/session/logout',
    signWith: 'TOKEN',
    type: 'WRITE',
    name: 'Logout an existing User with email',
    description: 'Allows to logout an existing user with email',
    roles: {
      SUPER_ADMIN: {
        role: Roles.SUPER_ADMIN.role,
        restriction: '',
      },
      ADMIN: {
        role: Roles.ADMIN.role,
        restriction: '',
      },
      USER: {
        role: Roles.USER.role,
        restriction: '',
      },
    },
  };

  //*****************************************************************//
  //************************* SEEDER ***************************//
  //*****************************************************************//

  /**
   * @description Resource that creates Super Admin user
   * @constant
   * @type {Object} SEED
   * @default
   */
  public static readonly SEED: IResource = {
    action: 'SEED',
    resource: 'SEEDER',
    verb: 'POST',
    endpoint: '/seeder',
    signWith: '',
    type: 'WRITE',
    name: 'Create Super Admin account',
    description: 'Create Super Admin account',
  };
}
