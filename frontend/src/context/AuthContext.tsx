import { createContext, useState, ReactNode } from "react";
import { getToken, getUserName, logout as doLogout } from "../api/auth";

interface AuthContextType {
  token: string | null;
  userName: string | null;
  isLoggedIn: boolean;
  login: (token: string, name: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getToken());
  const [userName, setUserName] = useState<string | null>(getUserName());

  const login = (token: string, name: string) => {
    setToken(token);
    setUserName(name);
  };

  const logout = () => {
    doLogout();
    setToken(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{
      token, userName,
      isLoggedIn: !!token,
      login, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

