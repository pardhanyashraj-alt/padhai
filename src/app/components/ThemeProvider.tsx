"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const PREF_KEY = "eduflow_theme_preference";
const LEGACY_THEME_KEY = "theme";

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolvePreference(pref: ThemePreference): ResolvedTheme {
  if (pref === "dark") return "dark";
  if (pref === "light") return "light";
  return getSystemDark() ? "dark" : "light";
}

function applyDomTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

interface ThemeContextType {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (p: ThemePreference) => void;
  /** @deprecated use setPreference — kept for any existing callers */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let pref: ThemePreference = "system";
    try {
      const stored = localStorage.getItem(PREF_KEY) as ThemePreference | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        pref = stored;
      } else {
        const legacy = localStorage.getItem(LEGACY_THEME_KEY);
        if (legacy === "light" || legacy === "dark") {
          pref = legacy;
          localStorage.removeItem(LEGACY_THEME_KEY);
          localStorage.setItem(PREF_KEY, pref);
        }
      }
    } catch {
      /* ignore */
    }
    setPreferenceState(pref);
    const resolved = resolvePreference(pref);
    setResolvedTheme(resolved);
    applyDomTheme(resolved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const resolved = resolvePreference(preference);
    setResolvedTheme(resolved);
    applyDomTheme(resolved);
    try {
      localStorage.setItem(PREF_KEY, preference);
    } catch {
      /* ignore */
    }
  }, [preference, mounted]);

  useEffect(() => {
    if (!mounted || preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = mq.matches ? "dark" : "light";
      setResolvedTheme(resolved);
      applyDomTheme(resolved);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mounted, preference]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferenceState((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "light";
      return getSystemDark() ? "light" : "dark";
    });
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      setPreference,
      toggleTheme,
    }),
    [preference, resolvedTheme, setPreference, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
