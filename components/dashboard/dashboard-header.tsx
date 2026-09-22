"use client";

import { CalendarRange, Filter, Menu, Moon, Plus, RotateCcw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JalaliRangePicker } from "@/components/dashboard/jalali-range-picker";
import { toPersianNumber } from "@/lib/formatters";
import type { CurrencyUnit, DatePreset, Filters } from "@/lib/types";

const presets: { value: DatePreset; label: string }[] = [
  { value: "thisMonth", label: "این ماه" },
  { value: "lastMonth", label: "ماه گذشته" },
  { value: "threeMonths", label: "۳ ماه اخیر" },
  { value: "sixMonths", label: "۶ ماه اخیر" },
  { value: "thisYear", label: "امسال" },
  { value: "lastYear", label: "سال گذشته" },
  { value: "all", label: "همه زمان‌ها" },
  { value: "custom", label: "بازه دلخواه" },
];

export function DashboardHeader({
  title,
  unit,
  setUnit,
  dark,
  setDark,
  filters,
  setFilters,
  accounts,
  categories,
  onImport,
  onMenu,
  onResetFilters,
  hasActiveFilters,
  resultCount,
}: {
  title: string;
  unit: CurrencyUnit;
  setUnit: (u: CurrencyUnit) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  filters: Filters;
  setFilters: (next: Filters) => void;
  accounts: string[];
  categories: { key: string; label: string }[];
  onImport: () => void;
  onMenu: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters({ ...filters, [key]: value });

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_86%,transparent)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6 xl:px-8">
        <div className="flex h-[68px] items-center gap-3">
          <button aria-label="باز کردن منو" className="icon-button shrink-0 lg:hidden" onClick={onMenu}>
            <Menu size={19} />
          </button>

          <div className="min-w-0">
            <p className="hidden text-[10.5px] font-semibold text-[var(--muted)] sm:block">فضای مالی شخصی</p>
            <h1 className="truncate text-[17px] font-extrabold tracking-tight">{title}</h1>
          </div>

          <div className="mr-auto flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border bg-[var(--surface)] px-3 py-1.5 text-[10.5px] text-[var(--muted)] xl:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              {toPersianNumber(resultCount)} رکورد در بازه
            </span>
            <button
              aria-label={dark ? "فعال‌کردن حالت روشن" : "فعال‌کردن حالت تیره"}
              aria-pressed={dark}
              className="icon-button shrink-0"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Button onClick={onImport} aria-label="ورود اطلاعات" size="icon" className="shrink-0 sm:hidden">
              <Plus size={18} />
            </Button>
            <Button onClick={onImport} className="hidden shrink-0 sm:inline-flex">
              <Plus size={16} />
              ورود اطلاعات
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-3">
          <span className="hidden items-center gap-1.5 pl-1 text-[10.5px] font-semibold text-[var(--muted)] md:inline-flex">
            <Filter size={13} />
            فیلترها
          </span>

          <label className="relative shrink-0">
            <CalendarRange size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <select aria-label="بازه زمانی" value={filters.datePreset} onChange={(e) => update("datePreset", e.target.value as DatePreset)} className="control w-[168px] appearance-none pr-9 pl-3">
              {presets.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          {filters.datePreset === "custom" && (
            <JalaliRangePicker
              start={filters.startDate ? new Date(filters.startDate) : undefined}
              end={filters.endDate ? new Date(filters.endDate) : undefined}
              onChange={(start, end) => setFilters({ ...filters, startDate: start?.toISOString().slice(0, 10), endDate: end?.toISOString().slice(0, 10) })}
            />
          )}

          <select aria-label="واحد نمایش" value={unit} onChange={(e) => setUnit(e.target.value as CurrencyUnit)} className="control shrink-0">
            <option value="IRT">نمایش به تومان</option>
            <option value="IRR">نمایش به ریال</option>
          </select>

          <select aria-label="فیلتر حساب" value={filters.account} onChange={(e) => update("account", e.target.value)} className="control max-w-[190px] shrink-0">
            <option value="all">همه حساب‌ها</option>
            {accounts.map((a) => (
              <option value={a} key={a}>
                {a}
              </option>
            ))}
          </select>

          <select aria-label="فیلتر دسته‌بندی" value={filters.category} onChange={(e) => update("category", e.target.value)} className="control shrink-0">
            <option value="all">همه دسته‌بندی‌ها</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="focus-ring inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[11px] px-3 text-[11px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            >
              <RotateCcw size={14} />
              پاک کردن فیلترها
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
