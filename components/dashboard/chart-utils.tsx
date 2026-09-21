"use client";

import type { CurrencyUnit } from "@/lib/types";
import { formatMoney } from "@/lib/formatters";
import { toBaseRial } from "@/lib/currency";

export function MoneyTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string; unit: CurrencyUnit }) {
  if (!active || !payload?.length) return null;
  const labels: Record<string, string> = { income: "درآمد", expenses: "هزینه", net: "خالص", amount: "مبلغ" };
  return <div dir="rtl" className="rounded-[10px] border bg-[var(--surface)] p-3 text-xs shadow-xl"><p className="mb-2 font-semibold">{label}</p>{payload.map((item) => <div key={item.name} className="mt-1.5 flex min-w-[170px] items-center justify-between gap-5"><span className="flex items-center gap-1.5 text-[var(--muted)]"><i className="h-2 w-2 rounded-full" style={{ background: item.color }} />{labels[item.name ?? ""] ?? item.name}</span><strong className="numbers">{formatMoney(toBaseRial(item.value ?? 0, unit), unit)}</strong></div>)}</div>;
}

export const CHART_COLORS = { income: "#15946a", expenses: "#d65a62", net: "#64748b", amber: "#d4993e", blue: "#5084c4", violet: "#8a6bbd" };
