"use client";

import { useState } from "react";
import { categoryStats } from "@/lib/financial-calculations";
import { formatMoney, toPersianNumber } from "@/lib/formatters";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function TopExpenses({ transactions, unit }: { transactions: Transaction[]; unit: CurrencyUnit }) {
  const [limit, setLimit] = useState(5);
  const items = categoryStats(transactions, "expenses").slice(0, limit);
  const max = items[0]?.amount ?? 1;
  return <section className="card p-4 md:p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">بیشترین هزینه‌ها</h2><p className="mt-1 text-xs text-[var(--muted)]">دسته‌های با بیشترین مجموع هزینه</p></div><select className="h-8 rounded-lg border bg-[var(--surface)] px-2 text-xs" value={limit} onChange={(e) => setLimit(Number(e.target.value))}><option value={5}>۵ مورد</option><option value={10}>۱۰ مورد</option></select></div><ol className="mt-4 space-y-3">{items.map((item, index) => <li key={item.key} className="grid grid-cols-[20px_1fr_auto] items-center gap-2 text-xs"><span className="text-[var(--muted)]">{toPersianNumber(index + 1)}</span><div className="min-w-0"><div className="flex justify-between gap-3"><span className="truncate font-medium">{item.label}</span></div><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--danger)]" style={{ width: `${item.amount / max * 100}%` }} /></div></div><strong className="numbers whitespace-nowrap">{formatMoney(item.amount, unit)}</strong></li>)}</ol></section>;
}
