import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Classes",
};

export default function StudentClassesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
