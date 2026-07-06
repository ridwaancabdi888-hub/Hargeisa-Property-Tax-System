export type UserRole = "admin" | "agent" | "viewer";

export interface AuthUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}
