import type { UserRole } from "./auth";

export interface ManagedUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdBy: number | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserListMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}

export interface CreateUserValues {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}
