"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Code2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currencyLabel, formatMoney, formatNumber, toPersianNumber } from "@/lib/formatters";
import { JALALI_MONTHS } from "@/lib/jalali-date";
import type { CurrencyUnit, Transaction } from "@/lib/types";

export function TransactionDetails({ transaction, unit, onClose }: { transaction: Transaction | null; unit: CurrencyUnit; onClose: () => void }) {
  if (!transaction) return null;
  const rows = [
    ["تاریخ شمسی", `${toPersianNumber(transaction.jalaliDay)} ${JALALI_MONTHS[transaction.jalaliMonth - 1]} ${toPersianNumber(transaction.jalaliYear)}`],
    ["تاریخ اصلی", toPersianNumber(transaction.originalDate)], ["شرح", transaction.description], ["حساب", transaction.account.raw],
    ["دسته‌بندی", transaction.account.categoryLabel], ["نوع", transaction.account.typeLabel],
    ["مبلغ اصلی", `${formatNumber(transaction.amount)} ${currencyLabel(transaction.originalUnit)}`], ["مبلغ تبدیل‌شده", formatMoney(transaction.amountIRR, unit)],
    ["وضعیت", transaction.status || "ثبت‌شده"], ["توضیحات", transaction.comment || "بدون توضیح"],
  ];
  return <Dialog.Root open onOpenChange={(open) => !open && onClose()}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-black/35"/><Dialog.Content dir="rtl" className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l bg-[var(--surface)] p-5 text-[var(--foreground)] shadow-2xl"><div className="flex items-center justify-between"><div><Dialog.Title className="font-bold">جزئیات تراکنش</Dialog.Title><Dialog.Description className="mt-1 text-xs text-[var(--muted)]">اطلاعات ثبت‌شده و مقدار تبدیل‌شده</Dialog.Description></div><Dialog.Close asChild><button className="icon-button"><X size={18}/></button></Dialog.Close></div><div className="mt-6 divide-y rounded-[12px] border px-4">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[120px_1fr] gap-3 py-3 text-xs"><span className="text-[var(--muted)]">{label}</span><strong className="numbers break-words text-left">{value}</strong></div>)}</div><details className="mt-5 rounded-[12px] border"><summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-xs font-semibold"><Code2 size={16}/>مشاهده داده خام</summary><pre dir="ltr" className="scrollbar-thin max-h-[320px] overflow-auto border-t bg-[var(--surface-muted)] p-4 text-left text-[11px] leading-5">{JSON.stringify(transaction.raw, null, 2)}</pre></details><Button variant="outline" className="mt-5 w-full" onClick={onClose}>بستن</Button></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
