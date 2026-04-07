import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
};

export default function SuperAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
