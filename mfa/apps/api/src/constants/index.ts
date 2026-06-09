export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export const MESSAGES = {
  SUCCESS: 'SUCCESS',
  CREATED: 'Resource created successfully',
  ACCEPTED: 'Request accepted for processing',
  NO_CONTENT: 'No content',

  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  CONFLICT: 'Conflict detected',
  PAYLOAD_TOO_LARGE: 'Payload too large',
  TOO_MANY_REQUESTS: 'Too many requests, slow down',

  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_IMPLEMENTED: 'Not implemented',
  BAD_GATEWAY: 'Bad gateway',
  SERVICE_UNAVAILABLE: 'Service unavailable',
  GATEWAY_TIMEOUT: 'Gateway timeout',
};
