"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { categoryStats } from "@/lib/financial-calculations";
import { formatMoney, formatPercent } from "@/lib/formatters";
import type { CurrencyUnit, Transaction, TransactionType } from "@/lib/types";

const COLORS = ["#15946a", "#d4993e", "#5084c4", "#d65a62", "#8a6bbd", "#6c8c81", "#b87854"];

export function CategoryChart({ transactions, unit, type, title, onCategory }: { transactions: Transaction[]; unit: CurrencyUnit; type: Extract<TransactionType, "income" | "expenses">; title: string; onCategory: (key: string) => void }) {
  const data = useMemo(() => categoryStats(transactions, type), [transactions, type]);
  return (
    <section className="card min-w-0 p-4 md:p-5"><div className="flex items-end justify-between"><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-xs text-[var(--muted)]">برای فیلتر، روی دسته کلیک کنید</p></div><span className="text-[11px] text-[var(--muted)]">{data.length.toLocaleString("fa-IR")} دسته</span></div>
      <div className="mt-3 grid items-center gap-2 sm:grid-cols-[160px_1fr]"><div className="h-[180px]" dir="ltr"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="amount" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="transparent" onClick={(item) => onCategory(String(item.payload.key))}>{data.map((item, index) => <Cell key={item.key} fill={COLORS[index % COLORS.length]} className="cursor-pointer outline-none" />)}</Pie><Tooltip formatter={(value) => formatMoney(Number(value), unit)} contentStyle={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: 10, fontSize: 11 }} /></PieChart></ResponsiveContainer></div>
      <div className="space-y-2.5">{data.slice(0, 6).map((item, index) => <button key={item.key} onClick={() => onCategory(item.key)} className="flex w-full items-center gap-2 text-right text-xs"><i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: COLORS[index % COLORS.length] }} /><span className="truncate">{item.label}</span><span className="numbers mr-auto whitespace-nowrap font-semibold">{formatMoney(item.amount, unit)}</span><span className="w-10 text-left text-[10px] text-[var(--muted)]">{formatPercent(item.percentage)}</span></button>)}</div></div>
    </section>
  );
}
