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
    endpoint: '/users/session',
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

  //*****************************************************************//
  //************************* TOKENS ***************************//
  //*****************************************************************//

  /**
   * @description Resource that captures the request to get user tokens
   * @constant
   * @type {Object} GET_TOKENS
   * @default
   */
  public static readonly GET_TOKENS: IResource = {
    action: 'GET_TOKENS',
    resource: 'TOKENS',
    verb: 'GET',
    endpoint: '/tokens',
    signWith: 'RSK',
    type: 'READ',
    name: 'Get Tokens',
    description: 'Gets the list of all tokens',
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
   * @description Resource that captures the request to create user tokens
   * @constant
   * @type {Object} CREATE_TOKENS
   * @default
   */
  public static readonly CREATE_TOKENS: IResource = {
    action: 'CREATE_TOKENS',
    resource: 'TOKENS',
    verb: 'POST',
    endpoint: '/tokens',
    signWith: 'RSK',
    type: 'WRITE',
    name: '',
    description: '',
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
   * @description Resource that captures the request to update user tokens
   * @constant
   * @type {Object} UPDATE_TOKENS
   * @default
   */
  public static readonly UPDATE_TOKENS: IResource = {
    action: 'UPDATE_TOKENS',
    resource: 'TOKENS',
    verb: 'PUT',
    endpoint: '/tokens',
    signWith: 'RSK',
    type: 'WRITE',
    name: '',
    description: '',
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
   * @description Resource that captures the request to delete user tokens
   * @constant
   * @type {Object} DELETE_TOKENS
   * @default
   */
  public static readonly DELETE_TOKENS: IResource = {
    action: 'DELETE_TOKENS',
    resource: 'TOKENS',
    verb: 'DELETE',
    endpoint: '/tokens',
    signWith: 'RSK',
    type: 'WRITE',
    name: '',
    description: '',
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
   * @description Resource that captures the request to validate user tokens
   * @constant
   * @type {Object} VALIDATE_TOKENS
   * @default
   */
  public static readonly VALIDATE_TOKENS: IResource = {
    action: 'VALIDATE_TOKENS',
    resource: 'TOKENS',
    verb: 'POST',
    endpoint: '/tokens/validate',
    signWith: 'RSK',
    type: 'WRITE',
    name: '',
    description: '',
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
   * @description Resource that captures the request to validate user permissions
   * @constant
   * @type {Object} VALIDATE_PERMISSIONS
   * @default
   */
  public static readonly VALIDATE_PERMISSIONS: IResource = {
    action: 'VALIDATE_PERMISSIONS',
    resource: 'TOKENS',
    verb: 'POST',
    endpoint: '/tokens/permissions/validate',
    signWith: 'RSK',
    type: 'WRITE',
    name: '',
    description: '',
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
}
