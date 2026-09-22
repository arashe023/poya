"use client";

import { Database, Download, HandCoins, Moon, ReceiptText, ShieldCheck, Sparkles, Sun, Trash2, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPersianNumber } from "@/lib/formatters";
import type { Commitment, ThemeMode, Transaction } from "@/lib/types";

export function SettingsView({
  transactions,
  commitments,
  theme,
  setTheme,
  onClear,
}: {
  transactions: Transaction[];
  commitments: Commitment[];
  theme: ThemeMode;
  setTheme: (v: ThemeMode) => void;
  onClear: () => void;
}) {
  const exportData = () => {
    const blob = new Blob([JSON.stringify(transactions.map((t) => t.raw), null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "poya-transactions.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const totals = [
    { label: "تراکنش ذخیره‌شده", value: toPersianNumber(transactions.length), icon: ReceiptText },
    { label: "تعهد گروهی", value: toPersianNumber(commitments.length), icon: HandCoins },
    { label: "وضعیت ذخیره‌سازی", value: "محلی", icon: WalletCards },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="card p-4 md:p-5">
        <div className="flex items-center gap-3">
          <span className="soft-accent flex h-11 w-11 items-center justify-center rounded-[13px]">
            <Moon size={18} />
          </span>
          <div>
            <h2 className="section-title">ظاهر برنامه</h2>
            <p className="section-sub">حالت مناسب محیط خود را انتخاب کنید. انتخاب شما ذخیره می‌شود.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => setTheme("light")}
            aria-pressed={theme === "light"}
            className={`focus-ring rounded-[14px] border p-4 text-right transition ${theme === "light" ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"}`}
          >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-1)]">
              <Sun size={17} />
            </span>
            <span className="block text-sm font-bold">روشن</span>
            <span className="mt-1 block text-[10.5px] opacity-80">مناسب محیط‌های پرنور</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
            className={`focus-ring rounded-[14px] border p-4 text-right transition ${theme === "dark" ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"}`}
          >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0c1d17] text-[#eaf3ef] shadow-[var(--shadow-1)]">
              <Moon size={17} />
            </span>
            <span className="block text-sm font-bold">تیره</span>
            <span className="mt-1 block text-[10.5px] opacity-80">سبز عمیق با کنتراست بالا</span>
          </button>
          <button
            onClick={() => setTheme("midnight")}
            aria-pressed={theme === "midnight"}
            className={`focus-ring rounded-[14px] border p-4 text-right transition ${theme === "midnight" ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"}`}
          >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0b1b2e] text-[#91e8ed] shadow-[var(--shadow-1)]">
              <Sparkles size={17} />
            </span>
            <span className="block text-sm font-bold">نیمه‌شب</span>
            <span className="mt-1 block text-[10.5px] opacity-80">سرمه‌ای آرام با تأکید فیروزه‌ای</span>
          </button>
        </div>
      </section>

      <section className="card p-4 md:p-5">
        <div className="flex items-center gap-3">
          <span className="soft-accent flex h-11 w-11 items-center justify-center rounded-[13px]">
            <Database size={18} />
          </span>
          <div>
            <h2 className="section-title">داده‌های محلی</h2>
            <p className="section-sub">همه اطلاعات در localStorage همین مرورگر نگهداری می‌شود.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {totals.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-[13px] border bg-[var(--surface-muted)] p-3 text-center">
                <Icon size={15} className="mx-auto text-[var(--muted)]" />
                <p className="numbers mt-2 text-sm font-extrabold">{item.value}</p>
                <p className="mt-1 text-[10px] text-[var(--muted)]">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData} disabled={!transactions.length}>
            <Download size={16} />
            دریافت نسخه پشتیبان
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("تمام اطلاعات محلی حذف شود؟ این کار قابل بازگشت نیست.")) onClear();
            }}
            disabled={!transactions.length && !commitments.length}
          >
            <Trash2 size={16} />
            حذف تمام اطلاعات محلی
          </Button>
        </div>
      </section>

      <section className="card p-4 md:p-5 xl:col-span-2">
        <div className="flex items-start gap-3">
          <span className="soft-accent flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h2 className="section-title">حریم خصوصی</h2>
            <p className="mt-2 max-w-3xl text-xs leading-7 text-[var(--muted)]">
              پویا بدون Backend کار می‌کند. پردازش، تبدیل ارز، محاسبه گزارش‌ها و ذخیره‌سازی همگی داخل مرورگر شما انجام می‌شوند و هیچ اطلاعات مالی به سرور ارسال نمی‌شود.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
