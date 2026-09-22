import { Lightbulb, TrendingUp } from "lucide-react";
import { generateInsights } from "@/lib/financial-calculations";
import { formatMoney } from "@/lib/formatters";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function FinancialInsights({ transactions, unit }: { transactions: Transaction[]; unit: CurrencyUnit }) {
  const insights = generateInsights(transactions).map((item) => ({ ...item, text: item.text.replace(/([\d,]+) ریال/, (match, amount) => formatMoney(Number(amount.replace(/,/g, "")), unit)) }));

  return (
    <section className="card card-hover overflow-hidden">
      <div className="flex items-center gap-3 border-b p-4 md:px-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--warning-soft)] text-[var(--warning)]">
          <Lightbulb size={19} />
        </span>
        <div>
          <h2 className="section-title">بینش‌های مالی</h2>
          <p className="mt-0.5 text-[11px] text-[var(--muted)]">تحلیل خودکار بر پایه داده‌های واقعی شما — بدون هوش مصنوعی</p>
        </div>
      </div>

      {!insights.length ? (
        <p className="p-8 text-center text-xs text-[var(--muted)]">برای تولید بینش، به داده‌ی کافی نیاز است.</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-5">
          {insights.map((item) => (
            <article key={item.title} className="border-b p-4 transition last:border-b-0 hover:bg-[var(--surface-muted)] md:border-l xl:border-b-0">
              <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--surface-muted)] text-[var(--muted)]">
                <TrendingUp size={15} />
              </span>
              <h3 className="text-xs font-bold">{item.title}</h3>
              <p className="mt-2 text-[11px] leading-6 text-[var(--muted)]">{item.text}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
