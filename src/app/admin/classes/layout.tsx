import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Management",
};

export default function ClassManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
