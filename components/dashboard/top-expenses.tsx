"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { categoryStats } from "@/lib/financial-calculations";
import { formatMoney, formatPercent, toPersianNumber } from "@/lib/formatters";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function TopExpenses({ transactions, unit }: { transactions: Transaction[]; unit: CurrencyUnit }) {
  const [limit, setLimit] = useState(5);
  const items = categoryStats(transactions, "expenses").slice(0, limit);
  const max = items[0]?.amount ?? 1;

  return (
    <section className="card card-hover p-4 md:p-5">
      <div className="section-head">
        <div>
          <h2 className="section-title">بیشترین هزینه‌ها</h2>
          <p className="section-sub">دسته‌های با بیشترین مجموع هزینه</p>
        </div>
        <select aria-label="تعداد موارد" className="control h-9 shrink-0 pr-2.5 pl-2.5 text-[11px]" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={5}>۵ مورد</option>
          <option value={10}>۱۰ مورد</option>
        </select>
      </div>

      {!items.length ? (
        <p className="py-10 text-center text-xs text-[var(--muted)]">هزینه‌ای برای نمایش نیست.</p>
      ) : (
        <ol className="mt-4 space-y-3.5">
          {items.map((item, index) => (
            <li key={item.key} className="grid grid-cols-[22px_1fr_auto] items-center gap-3 text-xs">
              <span className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--muted)]">{toPersianNumber(index + 1)}</span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-semibold">{item.label}</span>
                  <span className="numbers shrink-0 text-[10px] text-[var(--muted)]">{formatPercent(item.percentage)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div className="h-full rounded-full bg-gradient-to-l from-[var(--danger)] to-[#e9a1a6]" style={{ width: `${(item.amount / max) * 100}%` }} />
                </div>
              </div>
              <strong className="numbers whitespace-nowrap">{formatMoney(item.amount, unit)}</strong>
            </li>
          ))}
        </ol>
      )}

      {items.length > 0 && (
        <p className="mt-4 flex items-center gap-1.5 border-t pt-3 text-[10.5px] text-[var(--muted)]">
          <Flame size={13} className="text-[var(--danger)]" />
          بیشترین هزینه در دسته «{items[0].label}»
        </p>
      )}
    </section>
  );
}
