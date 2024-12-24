import { User } from "firebase/auth";

export type UserRole = "admin" | "user";

export interface AuthContextType {
  user: User | null;
  role: UserRole;
  avatar: string | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}