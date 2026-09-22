"use client";

import type { ReactNode } from "react";
import type { CurrencyUnit } from "@/lib/types";
import { formatMoney } from "@/lib/formatters";
import { toBaseRial } from "@/lib/currency";

export function MoneyTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string; unit: CurrencyUnit }) {
  if (!active || !payload?.length) return null;
  const labels: Record<string, string> = { income: "درآمد", expenses: "هزینه", net: "خالص", amount: "مبلغ" };
  return (
    <div dir="rtl" className="rounded-[12px] border bg-[var(--surface)] p-3 text-xs shadow-[var(--shadow-2)]">
      <p className="mb-2 text-[11px] font-bold">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="mt-1.5 flex min-w-[176px] items-center justify-between gap-5">
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <i className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            {labels[item.name ?? ""] ?? item.name}
          </span>
          <strong className="numbers text-[11px]">{formatMoney(toBaseRial(item.value ?? 0, unit), unit)}</strong>
        </div>
      ))}
    </div>
  );
}

export function ChartCard({ title, subtitle, action, className, children }: { title: string; subtitle?: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={`card card-hover min-w-0 p-4 md:p-5 ${className ?? ""}`}>
      <div className="section-head">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export const CHART_COLORS = { income: "#15946a", expenses: "#d65a62", net: "#64748b", amber: "#d4993e", blue: "#5084c4", violet: "#8a6bbd" };
export const SERIES_COLORS = ["#15946a", "#d4993e", "#5084c4", "#d65a62", "#8a6bbd", "#6c8c81", "#b87854"];
