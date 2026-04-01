"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch, setTokens, clearTokens, getAccessToken, getStoredRole, API_BASE, UserRole } from "../lib/api";

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getAccessToken(); // scans all roles
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

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const detail =
          err?.detail ||
          (res.status === 401 ? "Invalid email or password" :
            res.status === 403 ? "Your account has been deactivated" :
              "Login failed. Please try again.");
        return { success: false, error: detail };
      }

      const data = await res.json();
      const role = data.user?.role as UserRole;                        // e.g. "teacher"
      const accessToken = data[`${role}_access_token`] as string;      // "teacher_access_token"
      const refreshToken = data[`${role}_refresh_token`] as string;    // "teacher_refresh_token"

      setTokens(role, accessToken, refreshToken);
      setUser(data.user);
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Unable to reach the server. Please ensure your backend is running.",
      };
    }
  };

  const logout = () => {
    const role = user?.role as UserRole | undefined;
    clearTokens(role);
    setUser(null);
    window.location.href = "/";
  };

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