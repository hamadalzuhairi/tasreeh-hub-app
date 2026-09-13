import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthResult, LoginInput, SignupInput, User } from "@tasreeh/shared";
import { api, ApiError } from "../api/client";
import { clearToken, getToken, setToken } from "./token-storage";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  async function refreshUser() {
    const token = await getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await api.get<User>("/api/auth/me");
      setUser(me);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearToken();
      }
      setUser(null);
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  async function login(input: LoginInput) {
    const result = await api.post<AuthResult>("/api/auth/login", input);
    await setToken(result.token);
    queryClient.clear();
    setUser(result.user);
  }

  async function signup(input: SignupInput) {
    const result = await api.post<AuthResult>("/api/auth/signup", input);
    await setToken(result.token);
    queryClient.clear();
    setUser(result.user);
  }

  async function logout() {
    await clearToken();
    queryClient.clear();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout, refreshUser }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
