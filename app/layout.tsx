import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "پویا | داشبورد مالی",
  description: "داشبورد خصوصی مدیریت مالی به زبان فارسی",
  applicationName: "پویا",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#07110e" },
  ],
  colorScheme: "light dark",
};

/* Applied before first paint so the saved theme never flashes. Keeps the same
   storage key that the dashboard uses (`poya-finance-theme`). */
const themeInit = `
try {
  var stored = localStorage.getItem("poya-finance-theme");
  var valid = stored === "light" || stored === "dark" || stored === "midnight";
  var theme = valid ? stored : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  if (theme !== "light") document.documentElement.classList.add(theme);
} catch (error) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="poya-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInit }} />
        <a
          href="#main-content"
          className="focus-ring sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-50 focus:rounded-[10px] focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-xs focus:shadow-lg"
        >
          پرش به محتوای اصلی
        </a>
        {children}
      </body>
    </html>
  );
}
