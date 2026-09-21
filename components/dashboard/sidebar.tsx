import { BarChart3, FileInput, HandCoins, Landmark, LayoutDashboard, ReceiptText, Settings2, WalletCards, X } from "lucide-react";
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
      {open && <button aria-label="بستن منو" className="fixed inset-0 z-30 bg-black/35 lg:hidden" onClick={onClose} />}
      <aside className={cn("fixed inset-y-0 right-0 z-40 flex w-[244px] flex-col bg-[var(--sidebar)] px-3 py-4 text-[var(--sidebar-text)] transition-transform duration-200 lg:translate-x-0", open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex h-12 items-center justify-between px-3">
          <button className="flex items-center gap-3 text-right" onClick={() => onViewChange("overview")}>
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#d8f86b] text-[#132119]"><WalletCards size={20} strokeWidth={2} /></span>
            <span><strong className="block text-[15px]">پویا</strong><small className="block text-[10px] text-[#9bada6]">مدیریت مالی شخصی</small></span>
          </button>
          <button aria-label="بستن" onClick={onClose} className="rounded-lg p-2 text-[#9bada6] hover:bg-white/10 lg:hidden"><X size={18} /></button>
        </div>
        <div className="mx-3 my-5 h-px bg-white/10" />
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => { onViewChange(item.id); onClose(); }} className={cn("flex h-11 w-full items-center gap-3 rounded-[11px] px-3 text-sm transition", view === item.id ? "bg-white/11 text-white" : "text-[#aebdb7] hover:bg-white/7 hover:text-white")}><Icon size={18} strokeWidth={1.7} /><span>{item.label}</span>{view === item.id && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-[#d8f86b]" />}</button>;
          })}
        </nav>
        <div className="mt-auto rounded-[12px] border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold"><span className="h-2 w-2 rounded-full bg-[#7adba9]" />ذخیره محلی فعال است</div>
          <p className="mt-2 text-[10px] leading-5 text-[#93a59e]">اطلاعات شما فقط در همین مرورگر نگهداری می‌شود.</p>
        </div>
      </aside>
    </>
  );
}
