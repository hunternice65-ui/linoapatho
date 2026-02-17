
export interface LineRequest {
  id: string;
  lineUserId: string;
  message: string;
  status: 'new' | 'replied';
  assignedTo: string;
  reply: string;
  createdAt: string;
  repliedAt: string;
  source: 'line' | 'form';
  contactInfo?: string;
  subject?: string;
}

export interface AdminUser {
  username: string;
  role: string;
}

export type ViewState = 'login' | 'dashboard' | 'setup' | 'public_form' | 'user_landing';
