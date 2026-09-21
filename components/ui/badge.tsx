import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "positive" | "negative" | "warning"; className?: string }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium", tone === "positive" && "bg-[var(--accent-soft)] text-[var(--accent-strong)]", tone === "negative" && "bg-[var(--danger-soft)] text-[var(--danger)]", tone === "warning" && "bg-[var(--warning-soft)] text-[var(--warning)]", tone === "neutral" && "bg-[var(--surface-muted)] text-[var(--muted)]", className)}>{children}</span>;
}
