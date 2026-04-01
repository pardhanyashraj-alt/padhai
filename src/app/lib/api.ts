export const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://padhai-backend-qbw5.onrender.com";

export type UserRole = "student" | "teacher" | "admin";
const ALL_ROLES: UserRole[] = ["student", "teacher", "admin"];

// ── Token helpers ──────────────────────────────────────────────
export function getAccessToken(role?: UserRole): string | null {
  if (typeof window === "undefined") return null;
  if (role) return localStorage.getItem(`${role}_access_token`);
  // No role provided — scan all roles and return the first match
  for (const r of ALL_ROLES) {
    const token = localStorage.getItem(`${r}_access_token`);
    if (token) return token;
  }
  return null;
}

export function getRefreshToken(role?: UserRole): string | null {
  if (typeof window === "undefined") return null;
  if (role) return localStorage.getItem(`${role}_refresh_token`);
  for (const r of ALL_ROLES) {
    const token = localStorage.getItem(`${r}_refresh_token`);
    if (token) return token;
  }
  return null;
}

/** Detects which role's tokens are currently stored. */
export function getStoredRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  for (const r of ALL_ROLES) {
    if (localStorage.getItem(`${r}_access_token`)) return r;
  }
  return null;
}

export function setTokens(role: UserRole, access: string, refresh: string) {
  localStorage.setItem(`${role}_access_token`, access);
  localStorage.setItem(`${role}_refresh_token`, refresh);
}

/** Clears tokens for a specific role, or all roles if none specified. */
export function clearTokens(role?: UserRole) {
  if (role) {
    localStorage.removeItem(`${role}_access_token`);
    localStorage.removeItem(`${role}_refresh_token`);
    return;
  }
  for (const r of ALL_ROLES) {
    localStorage.removeItem(`${r}_access_token`);
    localStorage.removeItem(`${r}_refresh_token`);
  }
}

// ── Core fetch wrapper (JSON) ──────────────────────────────────
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  const role = getStoredRole();
  const refreshToken = role ? getRefreshToken(role) : null;
  if (!refreshToken || !role) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  if (!res.ok) {
    clearTokens(role);
    return null;
  }

  const data = await res.json();
  const newAccess = data[`${role}_access_token`] as string;   // ← role-prefixed key
  localStorage.setItem(`${role}_access_token`, newAccess);
  return newAccess;
}

/**
 * Authenticated JSON fetch.
 * Automatically attaches the access token and retries once on 401 using refresh.
 */
export async function apiFetch(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: any } = {}
): Promise<Response> {
  const role = getStoredRole();
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
    res = await fetch(`${API_BASE}${path}`, fetchOptions);
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
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } else {
      if (typeof window !== "undefined") {
        clearTokens();
        window.location.href = "/login";
      }
    }
  }

  return res;
}

/**
 * Authenticated FormData fetch (for file uploads).
 * Do NOT set Content-Type — the browser adds the multipart boundary automatically.
 */
export async function apiFormData(
  path: string,
  formData: FormData
): Promise<Response> {
  const role = getStoredRole();
  const accessToken = role ? getAccessToken(role) : null;

  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
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
      res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers,
        body: formData,
      });
    } else {
      if (typeof window !== "undefined") {
        clearTokens();
        window.location.href = "/superadmin/login";
      }
    }
  }

  return res;
}