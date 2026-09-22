"use client";

import { ChevronDown, ChevronLeft, FolderTree } from "lucide-react";
import { useMemo, useState } from "react";
import { formatMoney, formatPercent, toPersianNumber } from "@/lib/formatters";
import { translateAccountSegment } from "@/lib/account-parser";
import type { CurrencyUnit, Transaction } from "@/lib/types";

interface Node {
  key: string;
  label: string;
  total: number;
  count: number;
  children: Map<string, Node>;
}

function treeFrom(transactions: Transaction[]) {
  const roots = new Map<string, Node>();
  transactions.forEach((t) => {
    let level = roots;
    let path = "";
    t.account.segments.forEach((segment) => {
      path = path ? `${path}:${segment}` : segment;
      let node = level.get(segment);
      if (!node) {
        node = { key: path, label: translateAccountSegment(segment), total: 0, count: 0, children: new Map() };
        level.set(segment, node);
      }
      node.total += Math.abs(t.amountIRR);
      node.count += 1;
      level = node.children;
    });
  });
  return roots;
}

const GRID = "grid-cols-[minmax(190px,1fr)_140px_140px_92px_84px]";

function AccountNode({ node, unit, grand, depth = 0 }: { node: Node; unit: CurrencyUnit; grand: number; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const children = [...node.children.values()];
  const share = (node.total / Math.max(1, grand)) * 100;

  return (
    <div>
      <button
        onClick={() => children.length && setOpen(!open)}
        aria-expanded={children.length ? open : undefined}
        className="focus-ring grid w-full items-center gap-3 rounded-[10px] px-3 py-3 text-right text-xs transition hover:bg-[var(--surface-muted)]"
        style={{ paddingRight: `${12 + depth * 22}px`, gridTemplateColumns: "minmax(190px,1fr) 140px 140px 92px 84px" }}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex w-4 shrink-0 justify-center text-[var(--muted)]">
            {children.length ? open ? <ChevronDown size={14} /> : <ChevronLeft size={14} /> : <span className="w-3.5" />}
          </span>
          <span className={depth === 0 ? "font-bold" : "truncate"}>{node.label}</span>
          {children.length > 0 && <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 text-[9.5px] text-[var(--muted)]">{toPersianNumber(children.length)}</span>}
        </span>
        <strong className="numbers text-left">{formatMoney(node.total, unit)}</strong>
        <span className="numbers text-left text-[var(--muted)]">{formatMoney(node.total / Math.max(1, node.count), unit)}</span>
        <span className="numbers text-left text-[var(--muted)]">{toPersianNumber(node.count)} </span>
        <span className="flex items-center justify-end gap-2">
          <span className="h-1 w-8 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(100, share)}%` }} />
          </span>
          <span className="numbers w-10 text-left text-[var(--muted)]">{formatPercent(share)}</span>
        </span>
      </button>
      {open && children.map((child) => <AccountNode key={child.key} node={child} unit={unit} grand={grand} depth={depth + 1} />)}
    </div>
  );
}

export function AccountTree({ transactions, unit }: { transactions: Transaction[]; unit: CurrencyUnit }) {
  const roots = useMemo(() => treeFrom(transactions), [transactions]);
  const grand = transactions.reduce((s, t) => s + Math.abs(t.amountIRR), 0);

  return (
    <section className="card card-hover overflow-hidden">
      <div className="flex items-center gap-3 border-b p-4 md:p-5">
        <span className="soft-accent flex h-11 w-11 items-center justify-center rounded-[13px]">
          <FolderTree size={19} />
        </span>
        <div>
          <h2 className="section-title">ساختار حساب‌ها</h2>
          <p className="section-sub">مجموع، میانگین، تعداد و سهم هر حساب — برای باز و بسته کردن روی هر ردیف کلیک کنید.</p>
        </div>
      </div>

      {!roots.size ? (
        <p className="p-10 text-center text-xs text-[var(--muted)]">حسابی برای نمایش نیست.</p>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[780px]">
            <div className={`grid ${GRID} gap-3 bg-[var(--surface-muted)] px-3 py-2.5 text-[10px] font-semibold text-[var(--muted)]`}>
              <span>نام حساب</span>
              <span className="text-left">مجموع</span>
              <span className="text-left">میانگین تراکنش</span>
              <span className="text-left">تعداد</span>
              <span className="text-left">سهم</span>
            </div>
            <div className="p-2">
              {[...roots.values()].map((node) => (
                <AccountNode key={node.key} node={node} unit={unit} grand={grand} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
