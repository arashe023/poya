import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpLeft } from "lucide-react";
import { formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  change,
  hint,
  tone = "neutral",
  invertTrend = false,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  change?: number;
  hint?: string;
  tone?: "neutral" | "positive" | "negative";
  invertTrend?: boolean;
}) {
  const hasChange = change !== undefined && Number.isFinite(change);
  const rising = (change ?? 0) >= 0;
  const good = invertTrend ? !rising : rising;

  return (
    <article className="card card-hover flex min-w-0 flex-col p-4 xl:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[var(--muted)]">{label}</span>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]",
            tone === "positive" && "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
            tone === "negative" && "bg-[var(--danger-soft)] text-[var(--danger)]",
            tone === "neutral" && "bg-[var(--surface-muted)] text-[var(--muted)]",
          )}
        >
          {icon}
        </span>
      </div>

      <div className="numbers mt-3.5 break-words text-[1.05rem] font-extrabold leading-snug tracking-tight sm:text-xl" title={value}>
        {value}
      </div>

      {hasChange ? (
        <div
          className={cn(
            "mt-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-semibold",
            good ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "bg-[var(--danger-soft)] text-[var(--danger)]",
          )}
        >
          {rising ? <ArrowUpLeft size={12} /> : <ArrowDownLeft size={12} />}
          <span>
            {formatPercent(change)} {rising ? "بیشتر" : "کمتر"} از ماه قبل
          </span>
        </div>
      ) : (
        <p className="mt-2 text-[11px] leading-6 text-[var(--muted)]">{hint ?? "در بازه انتخابی"}</p>
      )}
    </article>
  );
}
