import { Lightbulb, TrendingUp } from "lucide-react";
import { generateInsights } from "@/lib/financial-calculations";
import { formatMoney } from "@/lib/formatters";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function FinancialInsights({ transactions, unit }: { transactions: Transaction[]; unit: CurrencyUnit }) {
  const insights = generateInsights(transactions).map((item) => ({ ...item, text: item.text.replace(/([\d,]+) ریال/, (match, amount) => formatMoney(Number(amount.replace(/,/g,"")), unit)) }));
  return <section className="card overflow-hidden"><div className="flex items-center gap-3 border-b p-4 md:px-5"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--warning-soft)] text-[var(--warning)]"><Lightbulb size={18} /></span><div><h2 className="font-bold">بینش‌های مالی</h2><p className="mt-0.5 text-[11px] text-[var(--muted)]">تحلیل خودکار بر پایه داده‌های واقعی شما</p></div></div><div className="grid md:grid-cols-2 xl:grid-cols-5">{insights.map((item, index) => <article key={item.title} className="border-b p-4 last:border-b-0 md:border-l xl:border-b-0"><span className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--muted)]"><TrendingUp size={14} /></span><h3 className="text-xs font-bold">{item.title}</h3><p className="mt-2 text-[11px] leading-6 text-[var(--muted)]">{item.text}</p></article>)}</div></section>;
}
