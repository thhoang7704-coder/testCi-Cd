// Authentication & User Types
export type UserRole = 'SYSTEM_ADMIN' | 'LAB_ADMIN' | 'COMPANY' | 'MENTOR' | 'TALENT' | 'TALENT_LEADER' | 'USER';

export interface User {
  id: string;
  email: string;
  // Canonical role used across the UI for routing/menu.
  role: UserRole;

  // Some parts of the UI/services still rely on snake_case.
  full_name?: string;
  fullName: string;

  username: string;
  phone?: string;
  avatarUrl?: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  is_active?: boolean;
  emailVerified: boolean;
  email_verified?: boolean;
  emailVerifiedAt?: string;
  email_verified_at?: string;
  lastLoginAt?: string;
  last_login_at?: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuth: boolean;
  token?: string;
}

export interface LoginRequest {
  // Backend uses `username`. Keep `email` optional for backward compatibility.
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}
