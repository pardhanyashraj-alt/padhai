import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { ScheduleProvider } from "../context/ScheduleContext";
import { AuthProvider } from "../context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EduFlow — Teacher Dashboard",
  description: "EduFlow Teacher Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInit = `(function(){try{var p=localStorage.getItem("eduflow_theme_preference");if(p!=="light"&&p!=="dark"&&p!=="system"){var leg=localStorage.getItem("theme");p=leg==="light"||leg==="dark"?leg:"system";}var dark=p==="dark"||(p!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(dark)document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark");}catch(e){}})();`;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable} style={{ fontFamily: "'Inter', sans-serif" }}>
        <Script
          id="eduflow-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />
        <ThemeProvider>
          <AuthProvider>
            <ScheduleProvider>{children}</ScheduleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
