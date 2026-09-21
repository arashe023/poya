import { ArrowLeft, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, toPersianNumber } from "@/lib/formatters";
import { JALALI_MONTHS } from "@/lib/jalali-date";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function RecentTransactions({ transactions, unit, onAll, onSelect }: { transactions: Transaction[]; unit: CurrencyUnit; onAll: () => void; onSelect: (t: Transaction) => void }) {
  const recent = [...transactions].sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0,5);
  return <section className="card p-4 md:p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">تراکنش‌های اخیر</h2><p className="mt-1 text-xs text-[var(--muted)]">آخرین فعالیت‌های ثبت‌شده</p></div><Button variant="ghost" size="sm" onClick={onAll}>مشاهده همه <ArrowLeft size={14} /></Button></div><div className="mt-3 divide-y">{recent.map((t) => { const income = t.account.type === "income"; return <button onClick={() => onSelect(t)} key={t.id} className="flex w-full items-center gap-3 py-3 text-right"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${income ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>{income ? <ArrowDownRight size={17}/> : <ArrowUpRight size={17}/>}</span><span className="min-w-0"><strong className="block truncate text-xs">{t.description}</strong><small className="mt-1 block text-[10px] text-[var(--muted)]">{toPersianNumber(t.jalaliDay)} {JALALI_MONTHS[t.jalaliMonth - 1]}، {t.account.categoryLabel}</small></span><strong className={`numbers mr-auto whitespace-nowrap text-xs ${income ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>{income ? "+" : "-"}{formatMoney(Math.abs(t.amountIRR), unit)}</strong></button>; })}</div></section>;
}
