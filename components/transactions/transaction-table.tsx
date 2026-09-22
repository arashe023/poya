"use client";

import { ArrowDown, ArrowUp, ChevronsLeft, ChevronsRight, SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { currencyLabel, formatMoney, toPersianNumber } from "@/lib/formatters";
import type { CurrencyUnit, Filters, Transaction } from "@/lib/types";

type SortKey = "date" | "amount" | "description";

export function TransactionTable({
  transactions,
  unit,
  filters,
  setFilters,
  accounts,
  categories,
  onSelect,
}: {
  transactions: Transaction[];
  unit: CurrencyUnit;
  filters: Filters;
  setFilters: (f: Filters) => void;
  accounts: string[];
  categories: { key: string; label: string }[];
  onSelect: (t: Transaction) => void;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortKey>("date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => setPage(1), [transactions.length, filters]);

  const sorted = useMemo(
    () =>
      [...transactions].sort((a, b) => {
        const av = sort === "date" ? a.date.getTime() : sort === "amount" ? Math.abs(a.amountIRR) : a.description;
        const bv = sort === "date" ? b.date.getTime() : sort === "amount" ? Math.abs(b.amountIRR) : b.description;
        const order = av < bv ? -1 : av > bv ? 1 : 0;
        return direction === "asc" ? order : -order;
      }),
    [transactions, sort, direction],
  );

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pages);
  const visible = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const from = sorted.length ? (safePage - 1) * pageSize + 1 : 0;
  const to = Math.min(sorted.length, safePage * pageSize);

  const sortBy = (key: SortKey) => {
    if (sort === key) setDirection(direction === "asc" ? "desc" : "asc");
    else {
      setSort(key);
      setDirection("desc");
    }
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "date", label: "تاریخ" },
    { key: "description", label: "شرح" },
  ];

  const resetFilters = () => setFilters({ datePreset: "all", account: "all", category: "all", type: "all", currency: "all", search: "" });

  return (
    <section className="card card-hover overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 p-4 md:p-5">
        <div>
          <h2 className="section-title">همه تراکنش‌ها</h2>
          <p className="section-sub">{toPersianNumber(transactions.length)} رکورد مطابق فیلترها · برای جزئیات روی هر ردیف کلیک کنید.</p>
        </div>
        <span className="rounded-full border bg-[var(--surface-muted)] px-3 py-1.5 text-[10.5px] font-semibold text-[var(--muted)]">
          نمایش {toPersianNumber(from)} تا {toPersianNumber(to)} از {toPersianNumber(sorted.length)}
        </span>
      </div>

      <TransactionFilters filters={filters} setFilters={setFilters} accounts={accounts} categories={categories} />

      {!visible.length ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--surface-muted)] text-[var(--muted)]">
            <SearchX size={22} />
          </span>
          <h3 className="text-sm font-bold">تراکنشی مطابق فیلترها پیدا نشد</h3>
          <p className="max-w-sm text-xs text-[var(--muted)]">بازه زمانی، حساب یا دسته‌بندی را تغییر دهید یا فیلترها را پاک کنید.</p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            پاک کردن فیلترها
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px] border-collapse text-right text-xs">
            <thead className="sticky-table-head text-[var(--muted)]">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 font-semibold">
                    <button onClick={() => sortBy(column.key)} className="focus-ring flex items-center gap-1 rounded transition hover:text-[var(--foreground)]">
                      {column.label}
                      {sort === column.key && (direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold">حساب</th>
                <th className="px-4 py-3 font-semibold">دسته‌بندی</th>
                <th className="px-4 py-3 font-semibold">نوع</th>
                <th className="px-4 py-3 text-left font-semibold">
                  <button onClick={() => sortBy("amount")} className="focus-ring mr-auto flex items-center gap-1 rounded transition hover:text-[var(--foreground)]">
                    مبلغ
                    {sort === "amount" && (direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">واحد</th>
                <th className="px-4 py-3 font-semibold">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((t) => (
                <tr key={t.id} onClick={() => onSelect(t)} className="cursor-pointer transition hover:bg-[var(--surface-muted)]">
                  <td className="numbers whitespace-nowrap px-4 py-3.5">{toPersianNumber(t.jalaliDate)}</td>
                  <td className="max-w-[220px] truncate px-4 py-3.5 font-semibold">{t.description}</td>
                  <td className="px-4 py-3.5 text-[var(--muted)]">
                    <span dir="ltr" className="inline-block max-w-[190px] truncate align-middle">{t.account.raw}</span>
                  </td>
                  <td className="px-4 py-3.5">{t.account.categoryLabel}</td>
                  <td className="px-4 py-3.5">
                    <Badge tone={t.account.type === "income" ? "positive" : t.account.type === "expenses" ? "negative" : "neutral"}>{t.account.typeLabel}</Badge>
                  </td>
                  <td className={`numbers whitespace-nowrap px-4 py-3.5 text-left font-bold ${t.account.type === "income" ? "text-[var(--accent-strong)]" : t.account.type === "expenses" ? "text-[var(--danger)]" : ""}`}>
                    {formatMoney(t.amountIRR, unit)}
                  </td>
                  <td className="px-4 py-3.5 text-[var(--muted)]">{currencyLabel(t.originalUnit)}</td>
                  <td className="px-4 py-3.5">
                    <Badge tone={t.status.includes("انتظار") ? "warning" : "neutral"} dot>
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-[var(--surface)] p-4 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-2">
          نمایش
          <select
            aria-label="تعداد ردیف در صفحه"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="control h-9 pr-2.5 pl-2.5 text-[11px]"
          >
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          ردیف
        </div>
        <span className="numbers">
          صفحه {toPersianNumber(safePage)} از {toPersianNumber(pages)}
        </span>
        <div className="flex gap-1.5">
          <Button aria-label="صفحه قبل" size="icon" variant="outline" className="h-9 w-9" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
            <ChevronsRight size={15} />
          </Button>
          <Button aria-label="صفحه بعد" size="icon" variant="outline" className="h-9 w-9" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)}>
            <ChevronsLeft size={15} />
          </Button>
        </div>
      </div>
    </section>
  );
}
