"use client";

import { useMemo } from "react";
import { CalendarClock, CircleDollarSign, HandCoins, Landmark, Scale, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { FinancialInsights } from "@/components/dashboard/financial-insights";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { MonthlyOverview } from "@/components/dashboard/monthly-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopExpenses } from "@/components/dashboard/top-expenses";
import { financialPosition, groupByJalaliMonth, previousMonthComparison } from "@/lib/financial-calculations";
import { formatMoney, formatPercent } from "@/lib/formatters";
import type { Commitment, CurrencyUnit, Transaction } from "@/lib/types";

export function Overview({
  transactions,
  allTransactions,
  comparisonTransactions,
  commitments,
  unit,
  onCategory,
  onTransactions,
  onSelect,
}: {
  transactions: Transaction[];
  allTransactions: Transaction[];
  comparisonTransactions: Transaction[];
  commitments: Commitment[];
  unit: CurrencyUnit;
  onCategory: (key: string) => void;
  onTransactions: () => void;
  onSelect: (t: Transaction) => void;
}) {
  const position = financialPosition(allTransactions, commitments);

  /* Trend numbers always compare the two most recent months that exist in the
     data, so they stay meaningful even when a date filter is active. */
  const latestMonth = useMemo(() => {
    const comparison = comparisonTransactions.length ? comparisonTransactions : transactions;
    const months = groupByJalaliMonth(comparison);
    const latest = months.at(-1);
    if (!latest) return null;
    return { latest, trend: previousMonthComparison(comparison) };
  }, [comparisonTransactions, transactions]);

  return (
    <div className="space-y-4">
      <section className="card p-4 md:p-5">
        <div className="section-head">
          <div>
            <h2 className="section-title">وضعیت مالی</h2>
            <p className="section-sub">موجودی قابل خرج فقط پول نقد است؛ طلب دوستان دارایی غیرنقدی محسوب می‌شود.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          <StatCard label="موجودی نقدی" value={formatMoney(position.cashBalance, unit)} hint="پول واقعی حساب‌های بانکی" icon={<WalletCards size={17} />} />
          <StatCard label="موجودی قابل خرج" value={formatMoney(position.spendableBalance, unit)} hint="فقط پول نقد در دسترس" tone="positive" icon={<Scale size={17} />} />
          <StatCard label="طلب از دوستان" value={formatMoney(position.totalReceivables, unit)} hint="دارایی غیرنقدی" tone="positive" icon={<HandCoins size={17} />} />
          <StatCard label="بدهی‌های پرداخت‌نشده" value={formatMoney(position.totalLiabilities, unit)} hint="باقی‌مانده پرداخت به سرویس‌ها" tone="negative" icon={<Landmark size={17} />} />
          <StatCard label="وضعیت خالص مالی" value={formatMoney(position.netPosition, unit)} hint="نقد + طلب − بدهی" icon={<CircleDollarSign size={17} />} />
        </div>
      </section>

      {latestMonth && (
        <section className="card p-4 md:p-5">
          <div className="section-head">
            <div>
              <h2 className="section-title">آخرین ماه ثبت‌شده</h2>
              <p className="section-sub">مقایسه {latestMonth.latest.label} با ماه پیش از آن در داده‌های شما.</p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-[10.5px] font-semibold text-[var(--muted)] sm:inline-flex">
              <CalendarClock size={13} />
              {latestMonth.latest.label}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="درآمد ماه"
              value={formatMoney(latestMonth.latest.income, unit)}
              change={latestMonth.trend.income}
              tone="positive"
              icon={<TrendingUp size={17} />}
            />
            <StatCard
              label="هزینه ماه"
              value={formatMoney(latestMonth.latest.expenses, unit)}
              change={latestMonth.trend.expenses}
              invertTrend
              tone="negative"
              icon={<TrendingDown size={17} />}
            />
            <StatCard
              label="خالص ماه"
              value={formatMoney(latestMonth.latest.net, unit)}
              hint={`نرخ پس‌انداز: ${formatPercent(latestMonth.latest.savingsRate)}`}
              icon={<CircleDollarSign size={17} />}
            />
          </div>
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <CashFlowChart transactions={transactions} unit={unit} />
        <CategoryChart transactions={transactions} unit={unit} type="expenses" title="هزینه بر اساس دسته‌بندی" onCategory={onCategory} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <IncomeExpenseChart transactions={transactions} unit={unit} />
        <CategoryChart transactions={transactions} unit={unit} type="income" title="درآمد بر اساس دسته‌بندی" onCategory={onCategory} />
      </div>

      <MonthlyOverview transactions={transactions} unit={unit} />

      <div className="grid gap-4 xl:grid-cols-2">
        <TopExpenses transactions={transactions} unit={unit} />
        <RecentTransactions transactions={transactions} unit={unit} onAll={onTransactions} onSelect={onSelect} />
      </div>

      <FinancialInsights transactions={transactions} unit={unit} />
    </div>
  );
}
