"use client";

import { CalendarRange, Menu, Moon, Plus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JalaliRangePicker } from "@/components/dashboard/jalali-range-picker";
import type { CurrencyUnit, DatePreset, Filters } from "@/lib/types";

const presets: { value: DatePreset; label: string }[] = [
  { value: "thisMonth", label: "این ماه" }, { value: "lastMonth", label: "ماه گذشته" }, { value: "threeMonths", label: "۳ ماه اخیر" },
  { value: "sixMonths", label: "۶ ماه اخیر" }, { value: "thisYear", label: "امسال" }, { value: "lastYear", label: "سال گذشته" },
  { value: "all", label: "همه زمان‌ها" }, { value: "custom", label: "بازه دلخواه" },
];

export function DashboardHeader({ title, unit, setUnit, dark, setDark, filters, setFilters, accounts, categories, onImport, onMenu }: {
  title: string; unit: CurrencyUnit; setUnit: (u: CurrencyUnit) => void; dark: boolean; setDark: (v: boolean) => void;
  filters: Filters; setFilters: (next: Filters) => void; accounts: string[]; categories: { key: string; label: string }[]; onImport: () => void; onMenu: () => void;
}) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters({ ...filters, [key]: value });
  return (
    <header className="sticky top-0 z-20 border-b bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-4 py-3 backdrop-blur-xl md:px-6 xl:px-8">
      <div className="flex items-center gap-3">
        <button aria-label="باز کردن منو" className="icon-button lg:hidden" onClick={onMenu}><Menu size={19} /></button>
        <div className="min-w-0"><p className="hidden text-[11px] text-[var(--muted)] sm:block">فضای مالی شخصی</p><h1 className="truncate text-lg font-bold">{title}</h1></div>
        <div className="mr-auto flex items-center gap-2">
          <Button onClick={onImport} className="hidden sm:inline-flex"><Plus size={16} />ورود اطلاعات</Button>
          <button aria-label={dark ? "فعال‌کردن حالت روشن" : "فعال‌کردن حالت تیره"} className="icon-button" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <label className="relative shrink-0"><CalendarRange size={15} className="pointer-events-none absolute right-3 top-3 text-[var(--muted)]" /><select aria-label="بازه زمانی" value={filters.datePreset} onChange={(e) => update("datePreset", e.target.value as DatePreset)} className="h-10 appearance-none rounded-[10px] border bg-[var(--surface)] pr-9 pl-8 text-xs outline-none focus:border-[var(--accent)]">{presets.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>
        {filters.datePreset === "custom" && <JalaliRangePicker start={filters.startDate ? new Date(filters.startDate) : undefined} end={filters.endDate ? new Date(filters.endDate) : undefined} onChange={(start, end) => setFilters({ ...filters, startDate: start?.toISOString().slice(0, 10), endDate: end?.toISOString().slice(0, 10) })} />}
        <select aria-label="واحد نمایش" value={unit} onChange={(e) => setUnit(e.target.value as CurrencyUnit)} className="h-10 shrink-0 rounded-[10px] border bg-[var(--surface)] px-3 text-xs outline-none focus:border-[var(--accent)]"><option value="IRT">نمایش به تومان</option><option value="IRR">نمایش به ریال</option></select>
        <select aria-label="فیلتر حساب" value={filters.account} onChange={(e) => update("account", e.target.value)} className="h-10 max-w-[180px] shrink-0 rounded-[10px] border bg-[var(--surface)] px-3 text-xs outline-none focus:border-[var(--accent)]"><option value="all">همه حساب‌ها</option>{accounts.map((a) => <option value={a} key={a}>{a}</option>)}</select>
        <select aria-label="فیلتر دسته‌بندی" value={filters.category} onChange={(e) => update("category", e.target.value)} className="h-10 shrink-0 rounded-[10px] border bg-[var(--surface)] px-3 text-xs outline-none focus:border-[var(--accent)]"><option value="all">همه دسته‌بندی‌ها</option>{categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
      </div>
    </header>
  );
}
