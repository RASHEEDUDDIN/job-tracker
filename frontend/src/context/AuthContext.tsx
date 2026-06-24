import { useState, ReactNode } from "react";
import { getToken, getUserName, logout as doLogout } from "../api/auth";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getToken());
  const [userName, setUserName] = useState<string | null>(getUserName());

  const login = (t: string, name: string) => {
    setToken(t);
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
