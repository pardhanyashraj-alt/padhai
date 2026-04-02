const DEFAULT_BACKEND = "https://padhai-backend-qbw5.onrender.com";

function normalizeBase(url: string): string {
  const t = url.trim().replace(/\/+$/, "");
  return t || DEFAULT_BACKEND;
}

/**
 * Single source of truth for the backend base URL.
 * On both server and browser, calls go directly to the backend.
 * Override via NEXT_PUBLIC_BASE_URL in .env.local (e.g. http://127.0.0.1:8000)
 */
export function getApiBase(): string {
  return normalizeBase(
    process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BACKEND
  );
}

/** For backwards compatibility */
export const API_BASE = getApiBase();

export type UserRole = "student" | "teacher" | "admin" | "sudo_admin";

// ── Role Detection from URL ─────────────────────────────────────────────────

export function getRoleFromPath(): UserRole | null {
  if (typeof window === "undefined") return null;

  const path = window.location.pathname.toLowerCase();

  if (path.startsWith("/sudo-admin") || path.startsWith("/superadmin")) return "sudo_admin";
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/teacher")) return "teacher";
  if (path.startsWith("/student")) return "student";

  return null;
}

// ── Token Helpers ───────────────────────────────────────────────────────────

export function getAccessToken(role?: UserRole): string | null {
  if (typeof window === "undefined") return null;

  const finalRole = role || getRoleFromPath();
  if (!finalRole) return null;

  return localStorage.getItem(`${finalRole}_access_token`);
}

export function getRefreshToken(role?: UserRole): string | null {
  if (typeof window === "undefined") return null;

  const finalRole = role || getRoleFromPath();
  if (!finalRole) return null;

  return localStorage.getItem(`${finalRole}_refresh_token`);
}

export function setTokens(role: UserRole, access: string, refresh: string) {
  localStorage.setItem(`${role}_access_token`, access);
  localStorage.setItem(`${role}_refresh_token`, refresh);
}

export function clearTokens(role?: UserRole) {
  if (role) {
    localStorage.removeItem(`${role}_access_token`);
    localStorage.removeItem(`${role}_refresh_token`);
    return;
  }
  const roles: UserRole[] = ["student", "teacher", "admin", "sudo_admin"];
  for (const r of roles) {
    localStorage.removeItem(`${r}_access_token`);
    localStorage.removeItem(`${r}_refresh_token`);
  }
}

// ── Refresh Logic ───────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  const role = getRoleFromPath();
  const refreshToken = role ? getRefreshToken(role) : null;

  if (!refreshToken || !role) return null;

  try {
    const res = await fetch(`${getApiBase()}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    if (!res.ok) {
      clearTokens(role);
      return null;
    }

    const data = await res.json();
    const newAccess = data[`${role}_access_token`] as string;
    localStorage.setItem(`${role}_access_token`, newAccess);
    return newAccess;
  } catch {
    return null;
  }
}

// ── Redirect Helper ─────────────────────────────────────────────────────────

function redirectToLogin() {
  if (typeof window === "undefined") return;

  const role = getRoleFromPath();

  if (role === "admin") window.location.href = "/admin/login";
  else if (role === "teacher") window.location.href = "/teacher/login";
  else if (role === "student") window.location.href = "/student/login";
  else if (role === "sudo_admin") window.location.href = "/sudo-admin/login";
  else window.location.href = "/login";
}

// ── Core Fetch Wrapper (JSON) ───────────────────────────────────────────────

export async function apiFetch(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: any } = {}
): Promise<Response> {
  const role = getRoleFromPath();
  const accessToken = role ? getAccessToken(role) : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const fetchOptions: RequestInit = { ...options, headers };

  if (
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof Blob)
  ) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  let res: Response;

  try {
    res = await fetch(`${getApiBase()}${path}`, fetchOptions);
  } catch {
    return new Response(JSON.stringify({ detail: "Cannot connect to server." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 401 — attempt a single token refresh
  if (res.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await (refreshPromise ?? tryRefresh());

    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${getApiBase()}${path}`, { ...fetchOptions, headers });
    } else {
      clearTokens();
      redirectToLogin();
    }
  }

  return res;
}

// ── FormData Fetch (file uploads) ───────────────────────────────────────────

export async function apiFormData(
  path: string,
  formData: FormData
): Promise<Response> {
  const role = getRoleFromPath();
  const accessToken = role ? getAccessToken(role) : null;

  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let res: Response;

  try {
    res = await fetch(`${getApiBase()}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch {
    return new Response(JSON.stringify({ detail: "Cannot connect to server." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (res.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await (refreshPromise ?? tryRefresh());

    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${getApiBase()}${path}`, {
        method: "POST",
        headers,
        body: formData,
      });
    } else {
      clearTokens();
      redirectToLogin();
    }
  }

  return res;
}