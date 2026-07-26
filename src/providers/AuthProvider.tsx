"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  api,
  extractAuthToken,
  extractUser,
  setStoredToken,
  getStoredToken,
  SESSION_TOKEN,
  type User,
} from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    login: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) => Promise<{
    ok: boolean;
    error?: string;
    needsVerification?: boolean;
    email?: string;
  }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const stored = getStoredToken();
    setToken(stored);
    if (!stored) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Session auth (same as backend website) — check via BFF
    if (stored === SESSION_TOKEN) {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          setUser(extractUser(json));
        } else {
          setStoredToken(null);
          setToken(null);
          setUser(null);
        }
      } catch {
        setStoredToken(null);
        setToken(null);
        setUser(null);
      }
      setLoading(false);
      return;
    }

    const res = await api.me();
    if (res.ok) {
      setUser(extractUser(res.data));
    } else {
      setStoredToken(null);
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (loginValue: string, password: string) => {
      // Prefer website-style login (no verification gate), same as
      // https://renhealth.backendpro.site/login
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ login: loginValue, password }),
        });
        const json = (await res.json()) as {
          message?: string;
          data?: { token?: string; user?: User };
        };
        if (res.ok) {
          setStoredToken(SESSION_TOKEN);
          setToken(SESSION_TOKEN);
          const nextUser = extractUser(json) || json.data?.user || null;
          if (nextUser) setUser(nextUser);
          else await refresh();
          return { ok: true };
        }

        // Fallback to mobile API bearer login if web session login fails
        const apiRes = await api.login({ login: loginValue, password });
        if (!apiRes.ok) {
          return { ok: false, error: json.message || apiRes.error };
        }
        const nextToken = extractAuthToken(apiRes.data);
        if (!nextToken) {
          return {
            ok: false,
            error: json.message || "Token missing in login response",
          };
        }
        setStoredToken(nextToken);
        setToken(nextToken);
        const nextUser = extractUser(apiRes.data);
        if (nextUser) setUser(nextUser);
        else await refresh();
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    },
    [refresh],
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      phone: string;
      password: string;
      password_confirmation: string;
    }) => {
      const res = await api.register(input);
      if (!res.ok) return { ok: false as const, error: res.error };
      const nextToken = extractAuthToken(res.data);
      if (nextToken) {
        setStoredToken(nextToken);
        setToken(nextToken);
        const nextUser = extractUser(res.data);
        if (nextUser) setUser(nextUser);
        else await refresh();
        return { ok: true as const, needsVerification: false };
      }
      // After register, sign in via web session (no verify wall)
      const loginRes = await login(input.email || input.phone, input.password);
      if (loginRes.ok) {
        return { ok: true as const, needsVerification: false };
      }
      return {
        ok: true as const,
        needsVerification: true,
        email: input.email,
      };
    },
    [refresh, login],
  );

  const logout = useCallback(async () => {
    try {
      if (getStoredToken() === SESSION_TOKEN) {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
        });
      } else {
        await api.logout();
      }
    } finally {
      setStoredToken(null);
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refresh }),
    [user, token, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
