"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MoneyTooltip, CHART_COLORS } from "@/components/dashboard/chart-utils";
import { fromBaseRial } from "@/lib/currency";
import { groupByJalaliMonth } from "@/lib/financial-calculations";
import { formatCompactMoney, toPersianNumber } from "@/lib/formatters";
import { JALALI_MONTHS } from "@/lib/jalali-date";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function IncomeExpenseChart({ transactions, unit }: { transactions: Transaction[]; unit: CurrencyUnit }) {
  const data = useMemo(() => groupByJalaliMonth(transactions).slice(-12).map((m) => ({ ...m, label: JALALI_MONTHS[m.month - 1], income: fromBaseRial(m.income, unit), expenses: fromBaseRial(m.expenses, unit) })), [transactions, unit]);
  return <section className="card min-w-0 p-4 md:p-5"><h2 className="font-bold">درآمد و هزینه ماهانه</h2><p className="mt-1 text-xs text-[var(--muted)]">مقایسه ۱۲ ماه اخیر</p><div className="mt-5 h-[300px]" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} barGap={3}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5"/><XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 9 }} axisLine={false} tickLine={false}/><YAxis width={58} tick={{ fill: "var(--muted)", fontSize: 9 }} tickFormatter={(value) => toPersianNumber(formatCompactMoney(value * (unit === "IRT" ? 10 : 1), unit))} axisLine={false} tickLine={false}/><Tooltip content={<MoneyTooltip unit={unit} />} cursor={{ fill: "var(--surface-muted)" }}/><Bar dataKey="income" fill={CHART_COLORS.income} radius={[5,5,0,0]} maxBarSize={20}/><Bar dataKey="expenses" fill={CHART_COLORS.expenses} radius={[5,5,0,0]} maxBarSize={20}/></BarChart></ResponsiveContainer></div></section>;
}
