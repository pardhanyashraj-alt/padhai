import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Students",
};

export default function MyStudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
