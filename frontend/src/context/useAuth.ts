import { createContext, useContext } from "react";

export interface AuthContextType {
  token: string | null;
  userName: string | null;
  isLoggedIn: boolean;
  login: (token: string, name: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
