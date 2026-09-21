import { formatMoney, formatPercent } from "@/lib/formatters";
import { groupByJalaliMonth } from "@/lib/financial-calculations";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function MonthlyOverview({ transactions, unit }: { transactions: Transaction[]; unit: CurrencyUnit }) {
  const months = groupByJalaliMonth(transactions).slice(-6).reverse();
  return <section className="card p-4 md:p-5"><div className="flex items-end justify-between"><div><h2 className="font-bold">نمای ماهانه</h2><p className="mt-1 text-xs text-[var(--muted)]">عملکرد شش ماه اخیر</p></div></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{months.map((month) => <article key={month.key} className="rounded-[12px] border bg-[var(--surface-muted)] p-4"><h3 className="text-sm font-bold">{month.label}</h3><div className="mt-4 grid grid-cols-2 gap-y-3 text-xs"><span className="text-[var(--muted)]">درآمد</span><strong className="numbers text-left text-[var(--accent)]">{formatMoney(month.income, unit)}</strong><span className="text-[var(--muted)]">هزینه</span><strong className="numbers text-left text-[var(--danger)]">{formatMoney(month.expenses, unit)}</strong><span className="text-[var(--muted)]">خالص</span><strong className="numbers text-left">{formatMoney(month.net, unit)}</strong><span className="text-[var(--muted)]">نرخ پس‌انداز</span><strong className="numbers text-left">{formatPercent(month.savingsRate)}</strong></div></article>)}</div></section>;
}
