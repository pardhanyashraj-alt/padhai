"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch, setTokens, clearTokens, getAccessToken, getApiBase, UserRole } from "../lib/api";

export interface AuthUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: string;
  school_id: string | null;
  is_active?: boolean;
  is_password_changed: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Session restore on mount ──────────────────────────────────────────────

  const loadUser = useCallback(async () => {
    const token = getAccessToken(); // reads from path-detected role
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/auth/me");
      if (res.ok) {
        setUser(await res.json());
      } else {
        clearTokens();
        setUser(null);
      }
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string, role: UserRole) => {
    // Each role gets its own endpoint. We try the primary first,
    // then the fallback if the primary returns 404.
    const endpointCandidatesByRole: Record<UserRole, string[]> = {
      admin: ["/admin/login", "/auth/admin/login"],
      teacher: ["/teacher/login", "/auth/teacher/login"],
      student: ["/student/login", "/auth/student/login"],
      sudo_admin: ["/sudo-admin/login", "/auth/sudo-admin/login"],
    };

    const base = getApiBase();
    let lastNetworkError: string | null = null;

    for (const endpoint of endpointCandidatesByRole[role]) {
      try {
        const res = await fetch(`${base}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        // 404 means this endpoint doesn't exist — try the next candidate
        if (res.status === 404) continue;

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          const detail =
            err?.detail ||
            (res.status === 401 ? "Invalid email or password" :
              res.status === 403 ? "Your account has been deactivated" :
                "Login failed. Please try again.");
          return {
            success: false,
            error: typeof detail === "string" ? detail : "Login failed. Please try again.",
          };
        }

        // ── Parse tokens from response ──────────────────────────────────────
        // Backend sends role-prefixed tokens, e.g. teacher_access_token.
        // "superadmin" from the API maps to "sudo_admin" in storage.
        const data = (await res.json()) as Record<string, unknown>;
        const userObj = data.user as { role?: string } | undefined;
        const apiRole = userObj?.role ?? "";

        const tokenVariants = [
          apiRole,
          apiRole === "superadmin" ? "sudo_admin" : null,
        ].filter(Boolean) as string[];

        let storageRole: UserRole | null = null;
        let accessToken: string | undefined;
        let refreshToken: string | undefined;

        for (const key of tokenVariants) {
          const a = data[`${key}_access_token`];
          const r = data[`${key}_refresh_token`];
          if (typeof a === "string" && typeof r === "string") {
            accessToken = a;
            refreshToken = r;
            if (key === "sudo_admin" || key === "superadmin") storageRole = "sudo_admin";
            else if (key === "admin" || key === "teacher" || key === "student") storageRole = key;
            break;
          }
        }

        if (!storageRole || !accessToken || !refreshToken) {
          return { success: false, error: "Invalid login response from server." };
        }

        setTokens(storageRole, accessToken, refreshToken);
        setUser(data.user as AuthUser);
        return { success: true };

      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        lastNetworkError = msg;
        continue;
      }
    }

    // All candidates exhausted — network error
    const isUnreachable =
      lastNetworkError?.includes("Failed to fetch") ||
      lastNetworkError === "Network error";

    return {
      success: false,
      error: isUnreachable
        ? "Cannot reach the server. Make sure your backend is running and NEXT_PUBLIC_BASE_URL is set correctly in .env.local."
        : `Cannot reach the API: ${lastNetworkError ?? "unknown error"}`,
    };
  };

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = () => {
    const role = user?.role as UserRole | undefined;
    clearTokens(role);
    setUser(null);
    window.location.href = "/";
  };

  // ── Refresh user data ─────────────────────────────────────────────────────

  const refreshUser = async () => {
    try {
      const res = await apiFetch("/auth/me");
      if (res.ok) setUser(await res.json());
    } catch { /* silently fail */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}