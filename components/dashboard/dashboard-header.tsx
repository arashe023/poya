"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CalendarRange, Check, Filter, Menu, Moon, Palette, Plus, RotateCcw, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JalaliRangePicker } from "@/components/dashboard/jalali-range-picker";
import { toPersianNumber } from "@/lib/formatters";
import type { CurrencyUnit, DatePreset, Filters, ThemeMode } from "@/lib/types";

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

const themes: { value: ThemeMode; label: string; hint: string; icon: typeof Sun }[] = [
  { value: "light", label: "روشن", hint: "شفاف و مناسب روز", icon: Sun },
  { value: "dark", label: "تیره", hint: "کنتراست بالا و سبز عمیق", icon: Moon },
  { value: "midnight", label: "نیمه‌شب", hint: "سرمه‌ای با تأکید فیروزه‌ای", icon: Sparkles },
];

export function DashboardHeader({
  title,
  unit,
  setUnit,
  theme,
  setTheme,
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
  theme: ThemeMode;
  setTheme: (v: ThemeMode) => void;
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
  const activeTheme = themes.find((item) => item.value === theme) ?? themes[0];
  const ActiveThemeIcon = activeTheme.icon;

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
            <DropdownMenu.Root dir="rtl">
              <DropdownMenu.Trigger asChild>
                <button aria-label={`انتخاب پوسته؛ پوسته فعلی ${activeTheme.label}`} className="icon-button shrink-0">
                  <ActiveThemeIcon size={18} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 min-w-[220px] rounded-[14px] border bg-[var(--surface)] p-1.5 text-[var(--foreground)] shadow-[var(--shadow-2)]"
                >
                  <div className="flex items-center gap-2 px-2.5 py-2 text-[10px] font-bold text-[var(--muted)]">
                    <Palette size={13} />
                    پوستهٔ برنامه
                  </div>
                  {themes.map((item) => {
                    const Icon = item.icon;
                    const selected = theme === item.value;
                    return (
                      <DropdownMenu.Item
                        key={item.value}
                        onSelect={() => setTheme(item.value)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 outline-none transition data-[highlighted]:bg-[var(--surface-muted)]"
                      >
                        <span className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${selected ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}>
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block text-xs">{item.label}</strong>
                          <small className="block text-[9.5px] text-[var(--muted)]">{item.hint}</small>
                        </span>
                        {selected && <Check size={15} className="text-[var(--accent-strong)]" />}
                      </DropdownMenu.Item>
                    );
                  })}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
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
