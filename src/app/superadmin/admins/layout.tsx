import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Management",
};

export default function AdminManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
