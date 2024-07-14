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
   * @type {Object} ADD_USERS
   * @default
   */
  public static readonly ADD_USERS: IResource = {
    action: 'ADD_USERS',
    resource: 'USERS',
    verb: 'POST',
    endpoint: '/users',
    signWith: '',
    type: 'WRITE',
    name: 'Add a new User',
    description: 'Allows to add a new user',
    roles: {
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
  public static readonly LOGIN_USERS_EMAIL: IResource = {
    action: 'LOGIN_USERS',
    resource: 'USERS',
    verb: 'POST',
    endpoint: '/users/session/email',
    signWith: '',
    type: 'WRITE',
    name: 'Login an existing User with email',
    description: 'Allows to login an existing user with email',
    roles: {
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
   * @description Resource that captures the request to create root user
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
    name: 'Create core accounts',
    description: 'Create core accounts',
    roles: {
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
   * @description Resource that captures the request to update root user permissions
   * @constant
   * @type {Object} UPDATE_PERMISSIONS
   * @default
   */
  public static readonly UPDATE_PERMISSIONS: IResource = {
    action: 'UPDATE_PERMISSIONS',
    resource: 'SEEDER',
    verb: 'PUT',
    endpoint: '/seeder/permissions',
    signWith: '',
    type: 'WRITE',
    name: 'Update existing user permissions',
    description: 'Update existing user permissions',
    roles: {
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
  //************************* CHATS ***************************//
  //*****************************************************************//

  /**
   * @description Resource that captures the request to get (*) chats
   * @constant
   * @type {Object} GET_CHATS
   * @default
   */
  public static readonly GET_CHATS: IResource = {
    action: 'GET_CHATS',
    resource: 'CHATS',
    verb: 'GET',
    endpoint: '/chats',
    signWith: 'TOKEN',
    type: 'READ',
    name: 'List All Chats',
    description: 'Allows retrieving the list of all chats',
    roles: {
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
   * @description Resource that captures the request to add a new chat by
   * creating a new entry in db
   * @constant
   * @type {Object} CREATE_CHATS
   * @default
   */
  public static readonly CREATE_CHATS: IResource = {
    action: 'CREATE_CHATS',
    resource: 'CHATS',
    verb: 'POST',
    endpoint: '/chats',
    signWith: 'TOKEN',
    type: 'WRITE',
    name: 'Add a new Chat',
    description: 'Allows to add a new chat',
    roles: {
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
   * @description Resource that captures the request to update a chat
   * @constant
   * @type {Object} UPDATE_CHATS
   * @default
   */
  public static readonly UPDATE_CHATS: IResource = {
    action: 'UPDATE_CHATS',
    resource: 'CHATS',
    verb: 'PUT',
    endpoint: '/chats',
    signWith: 'TOKEN',
    type: 'WRITE',
    name: 'Update an existing Chat',
    description: 'Allows to update an existing chat',
    roles: {
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
   * @description Resource that captures the request to delete a chat
   * @constant
   * @type {Object} DELETE_CHATS
   * @default
   */
  public static readonly DELETE_CHATS: IResource = {
    action: 'DELETE_CHATS',
    resource: 'CHATS',
    verb: 'DELETE',
    endpoint: '/chats',
    signWith: 'TOKEN',
    type: 'WRITE',
    name: 'Delete an existing Chat',
    description: 'Allows to delete an existing chat',
    roles: {
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

  //*****************************************************************//
  //************************* MESSAGES ***************************//
  //*****************************************************************//

  /**
   * @description Resource that captures the request to get (*) messages
   * @constant
   * @type {Object} GET_MESSAGES
   * @default
   */
  public static readonly GET_MESSAGES: IResource = {
    action: 'GET_MESSAGES',
    resource: 'MESSAGES',
    verb: 'GET',
    endpoint: '/messages',
    signWith: 'TOKEN',
    type: 'READ',
    name: 'List All Messages',
    description: 'Allows retrieving the list of all messages',
    roles: {
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
   * @description Resource that captures the request to add a new message by
   * creating a new entry in db
   * @constant
   * @type {Object} CREATE_MESSAGES
   * @default
   */
  public static readonly CREATE_MESSAGES: IResource = {
    action: 'CREATE_MESSAGES',
    resource: 'MESSAGES',
    verb: 'POST',
    endpoint: '/messages',
    signWith: 'TOKEN',
    type: 'WRITE',
    name: 'Add a new Message',
    description: 'Allows to add a new message',
    roles: {
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
   * @description Resource that captures the request to update a message
   * @constant
   * @type {Object} UPDATE_MESSAGES
   * @default
   */
  public static readonly UPDATE_MESSAGES: IResource = {
    action: 'UPDATE_MESSAGES',
    resource: 'MESSAGES',
    verb: 'PUT',
    endpoint: '/messages',
    signWith: 'TOKEN',
    type: 'WRITE',
    name: 'Update an existing Message',
    description: 'Allows to update an existing message',
    roles: {
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
   * @description Resource that captures the request to delete a message
   * @constant
   * @type {Object} DELETE_MESSAGES
   * @default
   */
  public static readonly DELETE_MESSAGES: IResource = {
    action: 'DELETE_MESSAGES',
    resource: 'MESSAGES',
    verb: 'DELETE',
    endpoint: '/messages',
    signWith: 'TOKEN',
    type: 'WRITE',
    name: 'Delete an existing Message',
    description: 'Allows to delete an existing message',
    roles: {
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
}
