"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, Code2, Copy, Landmark, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currencyLabel, formatMoney, formatNumber, toPersianNumber } from "@/lib/formatters";
import { JALALI_MONTHS } from "@/lib/jalali-date";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function TransactionDetails({ transaction, unit, onClose }: { transaction: Transaction | null; unit: CurrencyUnit; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  if (!transaction) return null;

  const raw = JSON.stringify(transaction.raw, null, 2);
  const postings = Array.isArray(transaction.raw.postings)
    ? transaction.raw.postings.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : [];
  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const rows: [string, string][] = [
    ["تاریخ شمسی", `${toPersianNumber(transaction.jalaliDay)} ${JALALI_MONTHS[transaction.jalaliMonth - 1]} ${toPersianNumber(transaction.jalaliYear)}`],
    ["تاریخ اصلی", toPersianNumber(transaction.originalDate)],
    ["شرح", transaction.description],
    ["حساب", transaction.account.raw],
    ["دسته‌بندی", transaction.account.categoryLabel],
    ["نوع", transaction.account.typeLabel],
    ["مبلغ اصلی", `${formatNumber(transaction.amount)} ${currencyLabel(transaction.originalUnit)}`],
    ["مبلغ تبدیل‌شده", formatMoney(transaction.amountIRR, unit)],
    ["وضعیت", transaction.status || "ثبت‌شده"],
    ["توضیحات", transaction.comment || "بدون توضیح"],
  ];

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          dir="rtl"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-[440px] overflow-y-auto border-l bg-[var(--surface)] p-5 text-[var(--foreground)] shadow-[var(--shadow-2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-base font-extrabold">جزئیات تراکنش</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[var(--muted)]">اطلاعات ثبت‌شده و مقدار تبدیل‌شده</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="icon-button h-9 w-9">
                <X size={17} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge tone={transaction.account.type === "income" ? "positive" : transaction.account.type === "expenses" ? "negative" : "neutral"}>{transaction.account.typeLabel}</Badge>
            <Badge tone={transaction.status.includes("انتظار") ? "warning" : "neutral"} dot>
              {transaction.status || "ثبت‌شده"}
            </Badge>
            <span className="numbers mr-auto text-sm font-extrabold">{formatMoney(transaction.amountIRR, unit)}</span>
          </div>

          <dl className="mt-5 divide-y rounded-[14px] border px-4">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[112px_1fr] gap-3 py-3 text-xs">
                <dt className="text-[var(--muted)]">{label}</dt>
                <dd className="numbers break-words text-left font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {postings.length > 0 && (
            <section className="mt-5 rounded-[14px] border">
              <div className="flex items-center gap-2 border-b p-4">
                <Landmark size={16} className="text-[var(--accent)]" />
                <h3 className="text-xs font-bold">ثبت‌های حسابداری</h3>
                <span className="numbers mr-auto rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] text-[var(--muted)]">{toPersianNumber(postings.length)} ردیف</span>
              </div>
              <div className="divide-y">
                {postings.map((posting, index) => (
                  <div key={`${String(posting.account)}-${index}`} className="flex items-center gap-3 px-4 py-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <p dir="ltr" className="truncate text-left font-mono text-[11px] font-semibold">{String(posting.account ?? "حساب نامشخص")}</p>
                      {posting.direction ? <p className="mt-1 text-[9.5px] text-[var(--muted)]">{String(posting.direction)}</p> : null}
                    </div>
                    <strong dir="ltr" className="numbers whitespace-nowrap text-[11px]">
                      {formatNumber(Number(posting.amount ?? 0))} {currencyLabel(transaction.originalUnit)}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          <details className="mt-5 rounded-[14px] border">
            <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-xs font-bold">
              <Code2 size={16} className="text-[var(--muted)]" />
              مشاهده داده خام
              <button
                onClick={(event) => {
                  event.preventDefault();
                  void copyRaw();
                }}
                className="focus-ring mr-auto inline-flex items-center gap-1 rounded-[9px] border px-2 py-1 text-[10px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "کپی شد" : "کپی"}
              </button>
            </summary>
            <pre dir="ltr" className="scrollbar-thin max-h-[320px] overflow-auto border-t bg-[var(--surface-muted)] p-4 text-left text-[11px] leading-5">
              {raw}
            </pre>
          </details>

          <Button variant="outline" className="mt-5 w-full" onClick={onClose}>
            بستن
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
