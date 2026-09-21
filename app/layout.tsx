import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "پویا | داشبورد مالی",
  description: "داشبورد خصوصی مدیریت مالی به زبان فارسی",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
