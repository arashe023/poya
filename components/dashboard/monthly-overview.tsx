import { formatMoney, formatPercent, toPersianNumber } from "@/lib/formatters";
import { groupByJalaliMonth } from "@/lib/financial-calculations";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function MonthlyOverview({ transactions, unit }: { transactions: Transaction[]; unit: CurrencyUnit }) {
  const months = groupByJalaliMonth(transactions).slice(-6).reverse();

  return (
    <section className="card p-4 md:p-5">
      <div className="section-head">
        <div>
          <h2 className="section-title">نمای ماهانه</h2>
          <p className="section-sub">عملکرد شش ماه اخیر همراه با نرخ پس‌انداز</p>
        </div>
      </div>

      {!months.length ? (
        <p className="py-8 text-center text-xs text-[var(--muted)]">داده‌ای برای نمایش نیست.</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {months.map((month) => {
            const positive = month.net >= 0;
            const rate = Math.max(0, Math.min(100, month.savingsRate));
            return (
              <article key={month.key} className="card-hover rounded-[14px] border bg-[var(--surface-muted)] p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">{month.label}</h3>
                  <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--muted)]">{toPersianNumber(month.count)} تراکنش</span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--muted)]">درآمد</span>
                    <strong className="numbers text-[var(--accent-strong)]">{formatMoney(month.income, unit)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--muted)]">هزینه</span>
                    <strong className="numbers text-[var(--danger)]">{formatMoney(month.expenses, unit)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t pt-2.5">
                    <span className="text-[var(--muted)]">خالص</span>
                    <strong className={`numbers ${positive ? "text-[var(--accent-strong)]" : "text-[var(--danger)]"}`}>{formatMoney(month.net, unit)}</strong>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10.5px] text-[var(--muted)]">
                    <span>نرخ پس‌انداز</span>
                    <span className="numbers font-semibold">{formatPercent(month.savingsRate)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface)]">
                    <div className={`h-full rounded-full ${positive ? "bg-[var(--accent)]" : "bg-[var(--danger)]"}`} style={{ width: `${rate}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
