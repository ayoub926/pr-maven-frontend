import { API_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from './config';

// Generic API error class
export class APIError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic API request handler
async function handleRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...API_CONFIG.DEFAULT_OPTIONS,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...(options.headers || {})
      },
      ...options,
    });

    // Handle different response statuses
    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      throw new APIError(ERROR_MESSAGES.UNAUTHORIZED, response.status);
    }

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      throw new APIError(ERROR_MESSAGES.NOT_FOUND, response.status);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || ERROR_MESSAGES.SERVER_ERROR,
        response.status,
        errorData
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new APIError(ERROR_MESSAGES.NETWORK_ERROR);
    }
    
    throw new APIError(ERROR_MESSAGES.SERVER_ERROR);
  }
}

// API endpoints
export const api = {
  auth: {
    login: (credentials: { username: string; password: string }) =>
      handleRequest<{ message: string }>('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    
    logout: () =>
      handleRequest<{ message: string }>('/logout', {
        method: 'POST',
      }),
  },

  emailAccounts: {
    list: (params: Record<string, any> = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      return handleRequest(`/email-accounts?${queryParams.toString()}`);
    },

    create: (data: any) =>
      handleRequest('/email-accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    get: (id: string) =>
      handleRequest(`/email-accounts/${id}`),

    update: (id: string, data: any) =>
      handleRequest(`/email-accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      handleRequest(`/email-accounts/${id}`, {
        method: 'DELETE',
      }),

    bulkDelete: (ids: string[]) =>
      handleRequest('/email-accounts/delete', {
        method: 'POST',
        body: JSON.stringify({ emailAccountIds: ids }),
      }),

    test: (id: string) =>
      handleRequest(`/email-accounts/${id}/test`, {
        method: 'POST',
      }),

    testConfig: (config: any) =>
      handleRequest('/email-accounts/test-smtp-imap', {
        method: 'POST',
        body: JSON.stringify(config),
      }),
  },

  queries: {
    list: (params: Record<string, any> = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      return handleRequest(`/queries-service/queries?${queryParams.toString()}`);
    },
  },

  emails: {
    send: (data: any) =>
      handleRequest('/email-service/send-email', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    listReplies: (params: Record<string, any> = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      return handleRequest(`/email-service/replies?${queryParams.toString()}`);
    },

    getReply: (id: string) =>
      handleRequest(`/email-service/replies/${id}`),

    markAsPublished: (id: string, url?: string) =>
      handleRequest(`/email-service/replies/${id}/mark-as-published`, {
        method: 'POST',
        body: JSON.stringify({ url }),
      }),

    getReportOverview: () =>
      handleRequest('/email-service/emails-report/overview'),
  },
};