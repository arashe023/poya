"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard, CHART_COLORS, MoneyTooltip } from "@/components/dashboard/chart-utils";
import { fromBaseRial } from "@/lib/currency";
import { groupByJalaliMonth } from "@/lib/financial-calculations";
import { formatCompactMoney, toPersianNumber } from "@/lib/formatters";
import { JALALI_MONTHS } from "@/lib/jalali-date";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function IncomeExpenseChart({ transactions, unit }: { transactions: Transaction[]; unit: CurrencyUnit }) {
  const data = useMemo(
    () => groupByJalaliMonth(transactions)
      .slice(-12)
      .map((m) => ({ ...m, label: JALALI_MONTHS[m.month - 1], income: fromBaseRial(m.income, unit), expenses: fromBaseRial(m.expenses, unit) })),
    [transactions, unit],
  );

  return (
    <ChartCard
      title="درآمد و هزینه ماهانه"
      subtitle="مقایسه ۱۲ ماه اخیر"
      action={
        <div className="hidden shrink-0 items-center gap-3 text-[10.5px] text-[var(--muted)] sm:flex">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS.income }} />
            درآمد
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS.expenses }} />
            هزینه
          </span>
        </div>
      }
    >
      <div className="mt-5 h-[300px]" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={3}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 6" />
            <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis
              width={58}
              tick={{ fill: "var(--muted)", fontSize: 9 }}
              tickFormatter={(value) => toPersianNumber(formatCompactMoney(value * (unit === "IRT" ? 10 : 1), unit))}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<MoneyTooltip unit={unit} />} cursor={{ fill: "var(--surface-muted)" }} />
            <Bar dataKey="income" fill={CHART_COLORS.income} radius={[5, 5, 0, 0]} maxBarSize={20} />
            <Bar dataKey="expenses" fill={CHART_COLORS.expenses} radius={[5, 5, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
