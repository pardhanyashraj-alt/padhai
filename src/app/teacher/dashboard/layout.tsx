import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Dashboard",
};

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
