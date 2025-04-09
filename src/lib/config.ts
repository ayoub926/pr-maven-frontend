// API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://app.prmavenai.com/api/v1',
  // Add 'credentials: "include"' to all fetch requests to handle cookies
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  DEFAULT_OPTIONS: {
    credentials: 'include' as RequestCredentials
  }
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};