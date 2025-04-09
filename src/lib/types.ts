// Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  role?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  defaultEmailAccount?: string;
  defaultReplyTemplate?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  preferences?: Partial<UserPreferences>;
}

// Email Account Types
export interface EmailAccount {
  emailAccountId: string;
  email: string;
  emailAccountName?: string;
  status: 'valid' | 'invalid';
  statusReason: string;
  smtpServer: string;
  smtpPortNumber: string;
  smtpSecurityProtocol: 'none' | 'ssl_tls' | 'starttls';
  imapServer: string;
  imapPortNumber: string;
  imapSecurityProtocol: 'none' | 'ssl_tls' | 'starttls';
  username: string;
  password: string;
  userId: string;
  dateCreated: string;
}

export interface EmailAccountFormData {
  emailAccountName?: string;
  smtpServer: string;
  smtpPortNumber: string;
  smtpSecurityProtocol: 'none' | 'ssl_tls' | 'starttls';
  imapServer: string;
  imapPortNumber: string;
  imapSecurityProtocol: 'none' | 'ssl_tls' | 'starttls';
  username: string;
  email: string;
  password: string;
}

export interface EmailAccountTestResult {
  status: 'valid' | 'invalid';
  statusReason: string;
}

// Query Types
export interface Query {
  itemId: string;
  userId: string;
  requestText: string;
  publicationName: string;
  platform: string;
  deadline: string;
  receivedDate: string;
  queryWriterEmail?: string;
  [key: string]: any;
}

// Email Service Types
export interface EmailSendRequest {
  emailAccountId: string;
  subjectLine: string;
  body: string;
  emailAddress: string;
  queryId: string;
}

export interface EmailReply {
  replyId: string;
  userId: string;
  queryWriterEmail: string;
  queryId: string;
  emailAccountEmailAddress: string;
  emailSentAt: string;
  replyStatus: string;
  replyAt: string | null;
  receivedDate: string;
  requestText: string;
  publicationName: string;
  platform: string;
  deadline: string;
  isPublished?: boolean;
  publishedUrl?: string;
}

export interface EmailReportOverview {
  totalSent: number;
  totalFailed: number;
  totalReplied: number;
  replyRate: number;
  totalOpened: number;
  openRate: number;
  totalClicked: number;
  clickRate: number;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Filter Types
export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}