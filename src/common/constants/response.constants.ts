export const ERROR_CODES = {
  // Validation errors
  INVALID_FIELD: 'INVALID_FIELD',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',

  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  DUPLICATE_ENTITY: 'DUPLICATE_ENTITY',

  // Friend request errors
  FRIEND_REQUEST_NOT_FOUND: 'FRIEND_REQUEST_NOT_FOUND',
  FRIEND_REQUEST_ALREADY_EXISTS: 'FRIEND_REQUEST_ALREADY_EXISTS',
  CANNOT_SEND_TO_SELF: 'CANNOT_SEND_TO_SELF',
  ALREADY_FRIENDS: 'ALREADY_FRIENDS',

  // Message errors
  NOT_FRIENDS: 'NOT_FRIENDS',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',

  // Permission errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ACCESS_DENIED: 'ACCESS_DENIED',

  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
} as const;

export const SUCCESS_MESSAGES = {
  // Auth
  REGISTRATION_SUCCESSFUL:
    'User registered successfully. Verify your email with the OTP sent.',
  EMAIL_VERIFIED: 'Email verified successfully',
  LOGIN_SUCCESSFUL: 'Login successful',

  // Users
  USERS_FETCHED: 'Users fetched successfully',
  USER_UPDATED: 'User updated successfully',

  // Friend requests
  FRIEND_REQUEST_SENT: 'Friend request sent successfully',
  FRIEND_REQUESTS_FETCHED: 'Friend requests fetched successfully',
  FRIEND_REQUEST_ACCEPTED: 'Friend request accepted successfully',
  FRIEND_REQUEST_REJECTED: 'Friend request rejected successfully',

  // Conversations
  CONVERSATIONS_FETCHED: 'Conversations fetched successfully',

  // Messages
  MESSAGE_SENT: 'Message sent successfully',
  MESSAGES_FETCHED: 'Messages fetched successfully',
} as const;
