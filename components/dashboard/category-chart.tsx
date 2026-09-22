"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard, SERIES_COLORS } from "@/components/dashboard/chart-utils";
import { categoryStats } from "@/lib/financial-calculations";
import { formatMoney, formatPercent, toPersianNumber } from "@/lib/formatters";
import type { CurrencyUnit, Transaction, TransactionType } from "@/lib/types";

export function CategoryChart({
  transactions,
  unit,
  type,
  title,
  onCategory,
}: {
  transactions: Transaction[];
  unit: CurrencyUnit;
  type: Extract<TransactionType, "income" | "expenses">;
  title: string;
  onCategory: (key: string) => void;
}) {
  const data = useMemo(() => categoryStats(transactions, type), [transactions, type]);

  return (
    <ChartCard
      title={title}
      subtitle="برای فیلتر کردن، روی دسته یا ردیف آن کلیک کنید"
      action={<span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10.5px] font-semibold text-[var(--muted)]">{toPersianNumber(data.length)} دسته</span>}
    >
      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[150px_1fr]">
        <div className="h-[170px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="label"
                innerRadius={50}
                outerRadius={74}
                paddingAngle={2}
                stroke="transparent"
                onClick={(item: { payload?: { key?: string } }) => item?.payload?.key && onCategory(String(item.payload.key))}
              >
                {data.map((item, index) => (
                  <Cell key={item.key} fill={SERIES_COLORS[index % SERIES_COLORS.length]} className="cursor-pointer outline-none" />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMoney(Number(value), unit)} contentStyle={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: 12, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-1.5">
          {data.slice(0, 6).map((item, index) => (
            <li key={item.key}>
              <button
                onClick={() => onCategory(item.key)}
                className="focus-ring flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-right text-xs transition hover:bg-[var(--surface-muted)]"
              >
                <i className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: SERIES_COLORS[index % SERIES_COLORS.length] }} />
                <span className="truncate">{item.label}</span>
                <span className="numbers mr-auto whitespace-nowrap font-bold">{formatMoney(item.amount, unit)}</span>
                <span className="numbers w-11 shrink-0 rounded-full bg-[var(--surface-muted)] px-1.5 text-center text-[10px] text-[var(--muted)]">{formatPercent(item.percentage)}</span>
              </button>
            </li>
          ))}
          {!data.length && <li className="px-2 py-6 text-center text-xs text-[var(--muted)]">داده‌ای برای نمایش نیست.</li>}
        </ul>
      </div>
    </ChartCard>
  );
}
