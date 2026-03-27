"use client";

import { AuthProvider } from "../context/AuthContext";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
