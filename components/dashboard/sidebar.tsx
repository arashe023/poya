import { BarChart3, FileInput, HandCoins, Landmark, LayoutDashboard, ReceiptText, Settings2, ShieldCheck, WalletCards, X } from "lucide-react";
import type { DashboardView } from "@/lib/types";
import { cn } from "@/lib/utils";

const navItems: { id: DashboardView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نمای کلی", icon: LayoutDashboard },
  { id: "transactions", label: "تراکنش‌ها", icon: ReceiptText },
  { id: "accounts", label: "حساب‌ها", icon: Landmark },
  { id: "commitments", label: "تعهدهای گروهی", icon: HandCoins },
  { id: "reports", label: "گزارش‌ها", icon: BarChart3 },
  { id: "import", label: "ورود اطلاعات", icon: FileInput },
  { id: "settings", label: "تنظیمات", icon: Settings2 },
];

export function Sidebar({ view, onViewChange, open, onClose }: { view: DashboardView; onViewChange: (view: DashboardView) => void; open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <button aria-label="بستن منو" className="fixed inset-0 z-30 bg-black/45 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        aria-label="منوی اصلی"
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-[min(252px,calc(100vw-2rem))] flex-col overflow-y-auto overscroll-contain border-l border-white/[0.06] bg-gradient-to-b from-[var(--sidebar)] to-[var(--sidebar-2)] px-3 py-4 text-[var(--sidebar-text)] transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "translate-x-full lg:shadow-none",
        )}
      >
        <div className="flex h-12 items-center justify-between px-2">
          <button className="focus-ring flex items-center gap-3 rounded-[12px] p-1 text-right" onClick={() => { onViewChange("overview"); onClose(); }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[var(--lime)] text-[#132119] shadow-[0_6px_16px_-8px_var(--lime)]">
              <WalletCards size={20} strokeWidth={2.1} />
            </span>
            <span>
              <strong className="block text-[15px] font-extrabold leading-tight">پویا</strong>
              <small className="mt-0.5 block text-[10px] text-[var(--sidebar-muted)]">مدیریت مالی شخصی</small>
            </span>
          </button>
          <button aria-label="بستن منو" onClick={onClose} className="rounded-lg p-2 text-[var(--sidebar-muted)] transition hover:bg-white/10 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        </div>

        <div className="mx-2 my-4 h-px bg-white/[0.08]" />
        <p className="px-3 pb-2 text-[10px] font-bold tracking-wide text-[var(--sidebar-muted)]">منو</p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                aria-current={active ? "page" : undefined}
                onClick={() => { onViewChange(item.id); onClose(); }}
                className={cn(
                  "group flex h-11 w-full items-center gap-3 rounded-[13px] px-2.5 text-sm transition",
                  active ? "bg-white/[0.09] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.05)]" : "text-[#a8bab3] hover:bg-white/[0.05] hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition",
                    active ? "bg-[var(--lime)] text-[#132119]" : "bg-white/[0.05] text-[#9db0a9] group-hover:bg-white/[0.09] group-hover:text-white",
                  )}
                >
                  <Icon size={16} strokeWidth={1.9} />
                </span>
                <span className="truncate">{item.label}</span>
                {active && <span className="mr-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--lime)] shadow-[0_0_0_3px_rgba(216,248,107,.16)]" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-[14px] border border-white/[0.08] bg-white/[0.04] p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7adba9] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7adba9]" />
              </span>
              ذخیره محلی فعال است
            </div>
            <p className="mt-2 text-[10px] leading-5 text-[var(--sidebar-muted)]">اطلاعات شما فقط در همین مرورگر نگهداری می‌شود.</p>
          </div>
          <p className="flex items-center justify-center gap-1.5 px-2 text-[10px] text-[var(--sidebar-muted)]">
            <ShieldCheck size={12} />
            نسخه ۱٫۰٫۰ · بدون بک‌اند
          </p>
        </div>
      </aside>
    </>
  );
}
