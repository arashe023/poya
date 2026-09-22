import { RotateCcw, Search } from "lucide-react";
import { TYPE_LABELS } from "@/lib/account-parser";
import type { CurrencyUnit, Filters, TransactionType } from "@/lib/types";

export function TransactionFilters({
  filters,
  setFilters,
  accounts,
  categories,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  accounts: string[];
  categories: { key: string; label: string }[];
}) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters({ ...filters, [key]: value });
  const active = filters.account !== "all" || filters.category !== "all" || filters.type !== "all" || filters.currency !== "all" || filters.search.trim() !== "";

  return (
    <div className="flex flex-wrap items-center gap-2 border-y bg-[var(--surface-muted)] p-3 md:px-4">
      <label className="relative min-w-[220px] flex-1">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="جستجو در شرح یا حساب..."
          aria-label="جستجو در تراکنش‌ها"
          className="control w-full pr-9"
        />
      </label>

      <select aria-label="نوع تراکنش" value={filters.type} onChange={(e) => update("type", e.target.value as TransactionType | "all")} className="control shrink-0">
        <option value="all">همه نوع‌ها</option>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      <select aria-label="حساب" value={filters.account} onChange={(e) => update("account", e.target.value)} className="control max-w-[210px] shrink-0">
        <option value="all">همه حساب‌ها</option>
        {accounts.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <select aria-label="دسته‌بندی" value={filters.category} onChange={(e) => update("category", e.target.value)} className="control shrink-0">
        <option value="all">همه دسته‌ها</option>
        {categories.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label}
          </option>
        ))}
      </select>

      <select aria-label="واحد پول" value={filters.currency} onChange={(e) => update("currency", e.target.value as CurrencyUnit | "all")} className="control shrink-0">
        <option value="all">همه واحدها</option>
        <option value="IRT">تومان</option>
        <option value="IRR">ریال</option>
      </select>

      {active && (
        <button
          onClick={() => setFilters({ ...filters, account: "all", category: "all", type: "all", currency: "all", search: "" })}
          className="focus-ring inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[11px] px-2.5 text-[11px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
        >
          <RotateCcw size={14} />
          پاک کردن
        </button>
      )}
    </div>
  );
}
