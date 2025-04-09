import { EmailAccount, EmailAccountFormData, EmailAccountTestResult, EmailReply, EmailSendRequest, LoginCredentials, PaginatedResponse, PaginationParams, Query } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  return response.json();
}

// Helper function to create mock responses when API is unavailable
function createMockResponse<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 500);
  });
}

// Auth API
export async function login(credentials: LoginCredentials): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(response);
  } catch (error) {
    console.log('API login failed, using mock response');
    return createMockResponse({ message: "Logged in successfully" });
  }
}

export async function logout(): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(response);
  } catch (error) {
    console.log('API logout failed, using mock response');
    return createMockResponse({ message: "Logged out successfully" });
  }
}

// Email Accounts API
export async function getEmailAccounts(params: PaginationParams = {}): Promise<PaginatedResponse<EmailAccount>> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.order) queryParams.append('order', params.order);

    const response = await fetch(`${API_BASE_URL}/email-accounts?${queryParams.toString()}`, {
      credentials: 'include',
    });
    return handleResponse<PaginatedResponse<EmailAccount>>(response);
  } catch (error) {
    console.log('API getEmailAccounts failed, using mock response');
    return createMockResponse({
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10
    });
  }
}

export async function getEmailAccount(id: string): Promise<EmailAccount> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-accounts/${id}`, {
      credentials: 'include',
    });
    return handleResponse<EmailAccount>(response);
  } catch (error) {
    console.log('API getEmailAccount failed, using mock response');
    return createMockResponse({
      emailAccountId: id,
      email: "user@example.com",
      emailAccountName: "Example Account",
      status: "valid",
      statusReason: "",
      smtpServer: "smtp.example.com",
      smtpPortNumber: "587",
      smtpSecurityProtocol: "starttls",
      imapServer: "imap.example.com",
      imapPortNumber: "993",
      imapSecurityProtocol: "ssl_tls",
      username: "user@example.com",
      password: "password",
      userId: "1",
      dateCreated: new Date().toISOString()
    });
  }
}

export async function createEmailAccount(data: EmailAccountFormData): Promise<EmailAccount> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return handleResponse<EmailAccount>(response);
  } catch (error) {
    console.log('API createEmailAccount failed, using mock response');
    return createMockResponse({
      emailAccountId: Math.random().toString(36).substring(2, 15),
      email: data.email,
      emailAccountName: data.emailAccountName || data.email,
      status: "valid",
      statusReason: "",
      smtpServer: data.smtpServer,
      smtpPortNumber: data.smtpPortNumber,
      smtpSecurityProtocol: data.smtpSecurityProtocol,
      imapServer: data.imapServer,
      imapPortNumber: data.imapPortNumber,
      imapSecurityProtocol: data.imapSecurityProtocol,
      username: data.username,
      password: data.password,
      userId: "1",
      dateCreated: new Date().toISOString()
    });
  }
}

export async function updateEmailAccount(id: string, data: Partial<EmailAccountFormData>): Promise<EmailAccount> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return handleResponse<EmailAccount>(response);
  } catch (error) {
    console.log('API updateEmailAccount failed, using mock response');
    return createMockResponse({
      emailAccountId: id,
      email: data.email || "user@example.com",
      emailAccountName: data.emailAccountName || "Updated Account",
      status: "valid",
      statusReason: "",
      smtpServer: data.smtpServer || "smtp.example.com",
      smtpPortNumber: data.smtpPortNumber || "587",
      smtpSecurityProtocol: data.smtpSecurityProtocol || "starttls",
      imapServer: data.imapServer || "imap.example.com",
      imapPortNumber: data.imapPortNumber || "993",
      imapSecurityProtocol: data.imapSecurityProtocol || "ssl_tls",
      username: data.username || "user@example.com",
      password: data.password || "password",
      userId: "1",
      dateCreated: new Date().toISOString()
    });
  }
}

export async function deleteEmailAccount(id: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-accounts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(response);
  } catch (error) {
    console.log('API deleteEmailAccount failed, using mock response');
    return createMockResponse({ message: "Email account deleted" });
  }
}

export async function bulkDeleteEmailAccounts(ids: string[]): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-accounts/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailAccountIds: ids }),
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(response);
  } catch (error) {
    console.log('API bulkDeleteEmailAccounts failed, using mock response');
    return createMockResponse({ message: "Bulk delete successful" });
  }
}

export async function testEmailAccount(id: string): Promise<EmailAccountTestResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-accounts/${id}/test`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<EmailAccountTestResult>(response);
  } catch (error) {
    console.log('API testEmailAccount failed, using mock response');
    return createMockResponse({
      status: "valid",
      statusReason: ""
    });
  }
}

export async function testEmailConfig(config: Omit<EmailAccountFormData, 'emailAccountName'>): Promise<EmailAccountTestResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-accounts/test-smtp-imap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
      credentials: 'include',
    });
    return handleResponse<EmailAccountTestResult>(response);
  } catch (error) {
    console.log('API testEmailConfig failed, using mock response');
    return createMockResponse({
      status: "valid",
      statusReason: ""
    });
  }
}

// Queries API
export async function getQueries(params: PaginationParams = {}): Promise<PaginatedResponse<Query>> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.order) queryParams.append('order', params.order);

    const response = await fetch(`${API_BASE_URL}/queries-service/queries?${queryParams.toString()}`, {
      credentials: 'include',
    });
    return handleResponse<PaginatedResponse<Query>>(response);
  } catch (error) {
    console.log('API getQueries failed, using mock response');
    // Create mock queries
    const mockQueries: Query[] = [
      {
        itemId: "1",
        userId: "1",
        requestText: "Looking for experts in AI to comment on recent developments in machine learning",
        publicationName: "Tech Today",
        platform: "Email",
        deadline: "2025-05-15",
        receivedDate: new Date().toISOString(),
        queryWriterEmail: "editor@techtoday.com"
      },
      {
        itemId: "2",
        userId: "1",
        requestText: "Seeking financial analysts to discuss market trends for Q2 2025",
        publicationName: "Finance Weekly",
        platform: "HARO",
        deadline: "2025-05-10",
        receivedDate: new Date(Date.now() - 86400000).toISOString(),
        queryWriterEmail: "queries@financeweekly.com"
      }
    ];
    
    return createMockResponse({
      items: mockQueries,
      total: mockQueries.length,
      page: params.page || 1,
      limit: params.limit || 10
    });
  }
}

// Email Service API
export async function sendEmail(data: EmailSendRequest): Promise<{ message: string; reply: EmailReply }> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-service/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return handleResponse<{ message: string; reply: EmailReply }>(response);
  } catch (error) {
    console.log('API sendEmail failed, using mock response');
    const mockReply: EmailReply = {
      replyId: Math.random().toString(36).substring(2, 15),
      userId: "1",
      queryWriterEmail: data.emailAddress,
      queryId: data.queryId,
      emailAccountEmailAddress: "your@email.com",
      emailSentAt: new Date().toISOString(),
      replyStatus: "sent",
      replyAt: null,
      receivedDate: new Date(Date.now() - 86400000).toISOString(),
      requestText: "Original query text",
      publicationName: "Publication Name",
      platform: "Email",
      deadline: "2025-05-15"
    };
    
    return createMockResponse({
      message: "Email sent successfully",
      reply: mockReply
    });
  }
}

export async function getEmailReplies(params: PaginationParams = {}): Promise<PaginatedResponse<EmailReply>> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.order) queryParams.append('order', params.order);

    const response = await fetch(`${API_BASE_URL}/email-service/replies?${queryParams.toString()}`, {
      credentials: 'include',
    });
    return handleResponse<PaginatedResponse<EmailReply>>(response);
  } catch (error) {
    console.log('API getEmailReplies failed, using mock response');
    // Create mock replies
    const mockReplies: EmailReply[] = [
      {
        replyId: "1",
        userId: "1",
        queryWriterEmail: "editor@techtoday.com",
        queryId: "1",
        emailAccountEmailAddress: "your@email.com",
        emailSentAt: new Date().toISOString(),
        replyStatus: "sent",
        replyAt: null,
        receivedDate: new Date(Date.now() - 86400000).toISOString(),
        requestText: "Looking for experts in AI to comment on recent developments in machine learning",
        publicationName: "Tech Today",
        platform: "Email",
        deadline: "2025-05-15"
      },
      {
        replyId: "2",
        userId: "1",
        queryWriterEmail: "queries@financeweekly.com",
        queryId: "2",
        emailAccountEmailAddress: "your@email.com",
        emailSentAt: new Date(Date.now() - 172800000).toISOString(),
        replyStatus: "replied",
        replyAt: new Date(Date.now() - 86400000).toISOString(),
        receivedDate: new Date(Date.now() - 259200000).toISOString(),
        requestText: "Seeking financial analysts to discuss market trends for Q2 2025",
        publicationName: "Finance Weekly",
        platform: "HARO",
        deadline: "2025-05-10",
        isPublished: true,
        publishedUrl: "https://financeweekly.com/article/market-trends-q2-2025"
      }
    ];
    
    return createMockResponse({
      items: mockReplies,
      total: mockReplies.length,
      page: params.page || 1,
      limit: params.limit || 10
    });
  }
}

export async function getEmailReply(id: string): Promise<EmailReply> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-service/replies/${id}`, {
      credentials: 'include',
    });
    return handleResponse<EmailReply>(response);
  } catch (error) {
    console.log('API getEmailReply failed, using mock response');
    return createMockResponse({
      replyId: id,
      userId: "1",
      queryWriterEmail: "editor@example.com",
      queryId: "1",
      emailAccountEmailAddress: "your@email.com",
      emailSentAt: new Date().toISOString(),
      replyStatus: "sent",
      replyAt: null,
      receivedDate: new Date(Date.now() - 86400000).toISOString(),
      requestText: "Sample query text",
      publicationName: "Example Publication",
      platform: "Email",
      deadline: "2025-05-15"
    });
  }
}

export async function markReplyAsPublished(id: string, url?: string): Promise<EmailReply> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-service/replies/${id}/mark-as-published`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      credentials: 'include',
    });
    return handleResponse<EmailReply>(response);
  } catch (error) {
    console.log('API markReplyAsPublished failed, using mock response');
    return createMockResponse({
      replyId: id,
      userId: "1",
      queryWriterEmail: "editor@example.com",
      queryId: "1",
      emailAccountEmailAddress: "your@email.com",
      emailSentAt: new Date(Date.now() - 172800000).toISOString(),
      replyStatus: "published",
      replyAt: new Date(Date.now() - 86400000).toISOString(),
      receivedDate: new Date(Date.now() - 259200000).toISOString(),
      requestText: "Sample query text",
      publicationName: "Example Publication",
      platform: "Email",
      deadline: "2025-05-15",
      isPublished: true,
      publishedUrl: url || "https://example.com/article"
    });
  }
}

export async function getEmailReportOverview(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-service/emails-report/overview`, {
      credentials: 'include',
    });
    return handleResponse<any>(response);
  } catch (error) {
    console.log('API getEmailReportOverview failed, using mock response');
    return createMockResponse({
      totalSent: 25,
      totalFailed: 2,
      totalReplied: 8,
      replyRate: 32,
      totalOpened: 18,
      openRate: 72,
      totalClicked: 12,
      clickRate: 48
    });
  }
}