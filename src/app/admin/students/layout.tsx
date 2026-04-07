import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Management",
};

export default function StudentManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
