"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard, CHART_COLORS, MoneyTooltip } from "@/components/dashboard/chart-utils";
import { formatCompactMoney, toPersianNumber } from "@/lib/formatters";
import { fromBaseRial } from "@/lib/currency";
import { groupByJalaliMonth } from "@/lib/financial-calculations";
import { JALALI_MONTHS } from "@/lib/jalali-date";
import { cn } from "@/lib/utils";
import type { CurrencyUnit, Transaction } from "@/lib/types";

type Period = "daily" | "weekly" | "monthly" | "yearly";

function dataForPeriod(transactions: Transaction[], period: Period) {
  if (period === "monthly") return groupByJalaliMonth(transactions).map((m) => ({ ...m, label: `${JALALI_MONTHS[m.month - 1]} ${toPersianNumber(m.year)}` }));
  const map = new Map<string, { key: string; label: string; income: number; expenses: number; net: number }>();
  transactions.forEach((t) => {
    const week = Math.ceil(t.jalaliDay / 7);
    const key = period === "daily" ? t.jalaliDate : period === "weekly" ? `${t.monthKey}-${week}` : String(t.jalaliYear);
    const label = period === "daily" ? `${toPersianNumber(t.jalaliDay)} ${JALALI_MONTHS[t.jalaliMonth - 1]}` : period === "weekly" ? `هفته ${toPersianNumber(week)}، ${JALALI_MONTHS[t.jalaliMonth - 1]}` : toPersianNumber(t.jalaliYear);
    const item = map.get(key) ?? { key, label, income: 0, expenses: 0, net: 0 };
    if (t.account.type === "income") item.income += Math.abs(t.amountIRR);
    if (t.account.type === "expenses") item.expenses += Math.abs(t.amountIRR);
    item.net = item.income - item.expenses;
    map.set(key, item);
  });
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function CashFlowChart({ transactions, unit }: { transactions: Transaction[]; unit: CurrencyUnit }) {
  const [period, setPeriod] = useState<Period>("monthly");
  const source = useMemo(() => dataForPeriod(transactions, period), [transactions, period]);
  const data = useMemo(() => source.map((item) => ({ ...item, income: fromBaseRial(item.income, unit), expenses: fromBaseRial(item.expenses, unit), net: fromBaseRial(item.net, unit) })), [source, unit]);
  const labels: { id: Period; label: string }[] = [
    { id: "daily", label: "روزانه" },
    { id: "weekly", label: "هفتگی" },
    { id: "monthly", label: "ماهانه" },
    { id: "yearly", label: "سالانه" },
  ];

  return (
    <ChartCard
      title="جریان مالی"
      subtitle="درآمد، هزینه و خالص در بازه انتخابی"
      className="xl:col-span-2"
      action={
        <div className="flex shrink-0 rounded-[12px] bg-[var(--surface-muted)] p-1" role="tablist" aria-label="بازه نمایش نمودار">
          {labels.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={period === item.id}
              onClick={() => setPeriod(item.id)}
              className={cn(
                "focus-ring rounded-[9px] px-3 py-1.5 text-[11px] font-semibold transition",
                period === item.id ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-1)]" : "text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="mt-5 h-[300px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 2, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.income} stopOpacity={0.26} />
                <stop offset="100%" stopColor={CHART_COLORS.income} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.expenses} stopOpacity={0.16} />
                <stop offset="100%" stopColor={CHART_COLORS.expenses} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 6" />
            <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={30} />
            <YAxis
              width={66}
              tick={{ fill: "var(--muted)", fontSize: 10 }}
              tickFormatter={(value) => toPersianNumber(formatCompactMoney(value * (unit === "IRT" ? 10 : 1), unit))}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<MoneyTooltip unit={unit} />} />
            <Area type="monotone" dataKey="income" stroke={CHART_COLORS.income} fill="url(#incomeFill)" strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" stroke={CHART_COLORS.expenses} fill="url(#expenseFill)" strokeWidth={2} />
            <Area type="monotone" dataKey="net" fill="transparent" stroke={CHART_COLORS.net} strokeDasharray="4 4" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-[#15946a]" />
          درآمد
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-[#d65a62]" />
          هزینه
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-[#64748b]" />
          خالص
        </span>
      </div>
    </ChartCard>
  );
}
