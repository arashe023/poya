import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpLeft } from "lucide-react";
import { formatPercent } from "@/lib/formatters";

export function StatCard({ label, value, icon, change, hint, tone = "neutral" }: { label: string; value: string; icon: ReactNode; change?: number; hint?: string; tone?: "neutral" | "positive" | "negative" }) {
  const positive = (change ?? 0) >= 0;
  return (
    <article className="card min-w-0 p-4 xl:p-5">
      <div className="flex items-center justify-between"><span className="text-xs font-medium text-[var(--muted)]">{label}</span><span className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${tone === "positive" ? "bg-[var(--accent-soft)] text-[var(--accent)]" : tone === "negative" ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}>{icon}</span></div>
      <div className="numbers mt-4 truncate text-xl font-extrabold tracking-tight xl:text-2xl">{value}</div>
      {change !== undefined ? <div className={`mt-2 flex items-center gap-1 text-[11px] ${positive ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>{positive ? <ArrowUpLeft size={13} /> : <ArrowDownLeft size={13} />}<span>{formatPercent(change)} {positive ? "بیشتر" : "کمتر"} از ماه قبل</span></div> : <p className="mt-2 truncate text-[11px] text-[var(--muted)]">{hint ?? "در بازه انتخابی"}</p>}
    </article>
  );
}
