"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { CHART_COLORS, MoneyTooltip } from "@/components/dashboard/chart-utils";
import { formatCompactMoney, toPersianNumber } from "@/lib/formatters";
import { fromBaseRial } from "@/lib/currency";
import { groupByJalaliMonth } from "@/lib/financial-calculations";
import { JALALI_MONTHS } from "@/lib/jalali-date";
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
  const labels: { id: Period; label: string }[] = [{ id: "daily", label: "روزانه" }, { id: "weekly", label: "هفتگی" }, { id: "monthly", label: "ماهانه" }, { id: "yearly", label: "سالانه" }];
  return (
    <section className="card min-w-0 p-4 md:p-5 xl:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">جریان مالی</h2><p className="mt-1 text-xs text-[var(--muted)]">درآمد، هزینه و خالص در بازه انتخابی</p></div><div className="flex rounded-[10px] bg-[var(--surface-muted)] p-1">{labels.map((item) => <Button key={item.id} size="sm" variant={period === item.id ? "outline" : "ghost"} className={period === item.id ? "bg-[var(--surface)] shadow-sm" : "border-transparent"} onClick={() => setPeriod(item.id)}>{item.label}</Button>)}</div></div>
      <div className="mt-5 h-[300px] w-full" dir="ltr"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 2, left: 4, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART_COLORS.income} stopOpacity={0.24}/><stop offset="100%" stopColor={CHART_COLORS.income} stopOpacity={0}/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART_COLORS.expenses} stopOpacity={0.15}/><stop offset="100%" stopColor={CHART_COLORS.expenses} stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5"/><XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={30}/><YAxis width={64} tick={{ fill: "var(--muted)", fontSize: 10 }} tickFormatter={(value) => toPersianNumber(formatCompactMoney(value * (unit === "IRT" ? 10 : 1), unit))} axisLine={false} tickLine={false}/><Tooltip content={<MoneyTooltip unit={unit} />} /><Area type="monotone" dataKey="income" stroke={CHART_COLORS.income} fill="url(#incomeFill)" strokeWidth={2}/><Area type="monotone" dataKey="expenses" stroke={CHART_COLORS.expenses} fill="url(#expenseFill)" strokeWidth={2}/><Area type="monotone" dataKey="net" stroke={CHART_COLORS.net} fill="transparent" strokeDasharray="4 4" strokeWidth={1.5}/></AreaChart></ResponsiveContainer></div>
      <div className="mt-3 flex justify-center gap-5 text-[11px] text-[var(--muted)]"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#15946a]" />درآمد</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#d65a62]" />هزینه</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#64748b]" />خالص</span></div>
    </section>
  );
}
