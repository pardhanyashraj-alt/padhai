import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin Settings",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
