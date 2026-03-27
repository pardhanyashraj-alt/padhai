export const API_BASE = "http://127.0.0.1:8000";

// ── Token helpers ──────────────────────────────────────────────
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ── Core fetch wrapper (JSON) ──────────────────────────────────
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  const newAccess = data.access_token as string;
  localStorage.setItem("access_token", newAccess);
  return newAccess;
}

/**
 * Authenticated JSON fetch.
 * Automatically attaches the access token and retries once on 401 using refresh.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // If 401, attempt a single refresh cycle
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
      // Refresh failed — force re-login
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
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

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
