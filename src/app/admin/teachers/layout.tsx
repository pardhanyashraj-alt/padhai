import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Management",
};

export default function TeacherManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
