export type UserRole = "TEACHER" | "STUDENT" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  whatsapp: string | null;
}

export interface AuthProfile {
  id: string;
  [key: string]: unknown;
}

export interface AuthSession {
  user: AuthUser;
  profile: AuthProfile | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  whatsapp?: string;
  bio?: string;
  hourlyRate?: number;
  subjectId?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
