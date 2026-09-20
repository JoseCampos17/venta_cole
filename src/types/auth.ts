export type UserRole = 'admin' | 'superadmin';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: string;
}
