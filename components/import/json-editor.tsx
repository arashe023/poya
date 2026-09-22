import { Braces } from "lucide-react";
import { toPersianNumber } from "@/lib/formatters";

export function JsonEditor({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor="json-editor" className="flex items-center gap-2 text-xs font-bold">
          <Braces size={15} />
          متن JSON
        </label>
        <span className="numbers text-[10px] text-[var(--muted)]">{toPersianNumber(value.length)} نویسه</span>
      </div>
      <textarea
        id="json-editor"
        dir="ltr"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'[\n  {\n    "date": "2026-09-09",\n    "amount": -15000000,\n    "account": "expenses:food",\n    "commodity": "IRR"\n  }\n]'}
        className={`scrollbar-thin min-h-[320px] w-full resize-y rounded-[13px] border bg-[var(--surface-muted)] p-4 font-mono text-xs leading-6 outline-none transition focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-ring)] ${
          error ? "border-[var(--danger)]" : ""
        }`}
      />
    </div>
  );
}
