import { CheckCircle2, ChevronDown, HandCoins, XCircle } from "lucide-react";
import { toPersianNumber } from "@/lib/formatters";
import type { ImportResult } from "@/lib/types";

export function ImportSummary({ result }: { result: ImportResult }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-[13px] bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)]">
        <CheckCircle2 size={19} />
        <div>
          <strong className="numbers block text-sm font-bold">{toPersianNumber(result.valid.length)} رکورد معتبر</strong>
          <span className="text-[10px] opacity-90">آماده ورود به داشبورد</span>
        </div>
      </div>
      <div className={`flex items-center gap-3 rounded-[13px] p-3 ${result.invalid.length ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}>
        <XCircle size={19} />
        <div>
          <strong className="numbers block text-sm font-bold">{toPersianNumber(result.invalid.length)} رکورد نامعتبر</strong>
          <span className="text-[10px] opacity-90">هنگام ورود نادیده گرفته می‌شود</span>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-[13px] bg-[var(--surface-muted)] p-3 text-[var(--foreground-soft)]">
        <HandCoins size={19} className="text-[var(--accent)]" />
        <div>
          <strong className="numbers block text-sm font-bold">{toPersianNumber(result.commitments?.length ?? 0)} تعهد گروهی</strong>
          <span className="text-[10px] text-[var(--muted)]">آماده ورود به بخش تعهدها</span>
        </div>
      </div>
      {result.invalid.length > 0 && (
        <details className="rounded-[13px] border sm:col-span-3">
          <summary className="flex cursor-pointer list-none items-center justify-between p-3 text-xs font-bold">
            مشاهده رکوردهای نامعتبر
            <ChevronDown size={15} />
          </summary>
          <div className="max-h-44 overflow-auto border-t p-2">
            {result.invalid.map((item) => (
              <div key={item.index} className="grid grid-cols-[64px_1fr] gap-2 rounded-[9px] px-2 py-2 text-[11px] odd:bg-[var(--surface-muted)]">
                <span className="numbers text-[var(--muted)]">ردیف {toPersianNumber(item.index + 1)}</span>
                <span className="text-[var(--danger)]">{item.reason}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
