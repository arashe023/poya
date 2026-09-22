"use client";

import { Check, ChevronDown, Plus, UsersRound, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { collectionStatus, commitmentStatus, friendsExpected, friendsReceived, friendsRemaining, friendStatus, providerRemaining } from "@/lib/financial-calculations";
import { formatMoney, formatPercent, toPersianNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Commitment, CurrencyUnit, FriendReceivable, PaymentStatus } from "@/lib/types";

const statusLabel: Record<PaymentStatus, string> = { pending: "در انتظار", partially_paid: "بخشی پرداخت شده", paid: "تسویه شده" };
const statusClass: Record<PaymentStatus, string> = {
  pending: "bg-[var(--warning-soft)] text-[var(--warning)]",
  partially_paid: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  paid: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
};
const money = (value: string) => Math.max(0, Math.round(Number(value.replaceAll(",", "")) || 0));

function Status({ value }: { value: PaymentStatus }) {
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold", statusClass[value])}>{statusLabel[value]}</span>;
}

export function CommitmentsView({ commitments, unit, onChange }: { commitments: Commitment[]; unit: CurrencyUnit; onChange: (items: Commitment[]) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [totalDue, setTotalDue] = useState("");
  const [paidToProvider, setPaidToProvider] = useState("");
  const [myShare, setMyShare] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [friends, setFriends] = useState<Array<{ name: string; expected: string }>>([{ name: "", expected: "" }]);

  const totalFriends = useMemo(() => friends.reduce((sum, friend) => sum + money(friend.expected), 0), [friends]);
  const remainingToSplit = money(totalDue) - money(myShare) - totalFriends;
  const canCreate = Boolean(name.trim() && money(totalDue) > 0 && remainingToSplit === 0);

  const create = () => {
    if (!canCreate) return;
    const cleanFriends: FriendReceivable[] = friends
      .filter((friend) => friend.name.trim() && money(friend.expected) > 0)
      .map((friend, index) => ({ id: `${Date.now()}-${index}`, name: friend.name.trim(), expected: money(friend.expected), received: 0 }));
    const next: Commitment = { id: `commitment-${Date.now()}`, name: name.trim(), totalDue: money(totalDue), paidToProvider: Math.min(money(paidToProvider), money(totalDue)), dueDate, myShare: money(myShare), receivables: cleanFriends };
    onChange([next, ...commitments]);
    setName("");
    setTotalDue("");
    setPaidToProvider("");
    setMyShare("");
    setDueDate("");
    setFriends([{ name: "", expected: "" }]);
    setOpen(false);
  };

  const receive = (commitmentId: string, friendId: string, amount: number) =>
    onChange(
      commitments.map((commitment) =>
        commitment.id !== commitmentId
          ? commitment
          : { ...commitment, receivables: commitment.receivables.map((friend) => (friend.id !== friendId ? friend : { ...friend, received: Math.min(friend.expected, friend.received + amount) })) },
      ),
    );

  return (
    <div className="space-y-5">
      <section className="card app-shell flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-4">
          <span className="soft-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px]">
            <WalletCards size={22} />
          </span>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">تعهدهای گروهی</h2>
            <p className="mt-1 max-w-2xl text-xs leading-6 text-[var(--muted)]">پرداخت سرویس و وصول سهم دوستان به‌صورت مستقل ثبت و دنبال می‌شوند.</p>
            <p className="mt-1 max-w-2xl text-[10.5px] leading-6 text-[var(--muted)]">
              پرداخت‌ها و وصول‌هایی که اینجا ثبت می‌کنید را دوباره به‌عنوان تراکنش نقدی وارد نکنید؛ از دوباره‌شماری جلوگیری می‌شود.
            </p>
          </div>
        </div>
        <Button onClick={() => setOpen(!open)} className="shrink-0">
          <Plus size={16} />
          {open ? "بستن فرم" : "افزودن تعهد"}
        </Button>
      </section>

      {open && (
        <section className="card p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="نام تعهد" value={name} onChange={setName} placeholder="مثلاً Digipay - ویلا" />
            <Field label="مبلغ کل تعهد (تومان)" value={totalDue} onChange={setTotalDue} type="number" />
            <Field label="پرداخت به سرویس (تومان)" value={paidToProvider} onChange={setPaidToProvider} type="number" />
            <Field label="سهم من (تومان)" value={myShare} onChange={setMyShare} type="number" />
            <Field label="سررسید" value={dueDate} onChange={setDueDate} type="date" />
          </div>

          <div className="mt-6 border-t pt-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold">سهم دوستان</h3>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  جمع ثبت‌شده: <span className="numbers font-semibold">{formatMoney(totalFriends * 10, unit)}</span> · سهم‌ها باید دقیقاً با کل تعهد برابر شوند.
                </p>
              </div>
              <button onClick={() => setFriends([...friends, { name: "", expected: "" }])} className="focus-ring rounded-lg px-2 py-1 text-xs font-bold text-[var(--accent-strong)] transition hover:bg-[var(--accent-soft)]">
                + افزودن دوست
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {friends.map((friend, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_200px]">
                  <input
                    className="control w-full"
                    value={friend.name}
                    onChange={(event) => setFriends(friends.map((item, i) => (i === index ? { ...item, name: event.target.value } : item)))}
                    placeholder="نام دوست"
                    aria-label={`نام دوست ${index + 1}`}
                  />
                  <input
                    className="control numbers w-full"
                    type="number"
                    value={friend.expected}
                    onChange={(event) => setFriends(friends.map((item, i) => (i === index ? { ...item, expected: event.target.value } : item)))}
                    placeholder="مبلغ سهم (تومان)"
                    aria-label={`مبلغ سهم دوست ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            {money(totalDue) > 0 && (
              <p className={cn("numbers mt-3 rounded-[11px] px-3 py-2 text-[11px]", remainingToSplit === 0 ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "bg-[var(--warning-soft)] text-[var(--warning)]")}>
                {remainingToSplit === 0
                  ? "سهم‌ها با کل تعهد برابر است. آماده ثبت."
                  : remainingToSplit > 0
                    ? `${formatMoney(Math.abs(remainingToSplit) * 10, unit)} از کل تعهد هنوز بین سهم من و دوستان تقسیم نشده است.`
                    : `${formatMoney(Math.abs(remainingToSplit) * 10, unit)} بیشتر از کل تعهد تقسیم شده است.`}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button disabled={!canCreate} onClick={create}>
              ثبت تعهد
            </Button>
          </div>
        </section>
      )}

      {!commitments.length ? (
        <section className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <UsersRound size={25} />
          </span>
          <h3 className="mt-4 font-bold">تعهد گروهی ثبت نشده است</h3>
          <p className="mt-2 max-w-sm text-xs leading-6 text-[var(--muted)]">برای شروع، پرداخت یک سرویس و سهم هر دوست را ثبت کنید تا وضعیت وصول هر نفر جداگانه دنبال شود.</p>
        </section>
      ) : (
        commitments.map((commitment) => <CommitmentCard key={commitment.id} commitment={commitment} unit={unit} onReceive={receive} />)
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block text-xs font-semibold text-[var(--muted)]">
      {label}
      <input
        className="control mt-2 h-11 w-full font-normal text-[var(--foreground)]"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function CommitmentCard({ commitment, unit, onReceive }: { commitment: Commitment; unit: CurrencyUnit; onReceive: (commitmentId: string, friendId: string, amount: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const provider = commitmentStatus(commitment);
  const collection = collectionStatus(commitment);
  const paidRatio = commitment.totalDue ? Math.min(100, (commitment.paidToProvider / commitment.totalDue) * 100) : 0;

  const metrics: [string, number][] = [
    ["کل تعهد", commitment.totalDue],
    ["پرداخت به سرویس", commitment.paidToProvider],
    ["باقی‌مانده سرویس", providerRemaining(commitment)],
    ["سهم من", commitment.myShare],
    ["سهم دوستان", friendsExpected(commitment)],
    ["دریافت از دوستان", friendsReceived(commitment)],
    ["طلب باقی‌مانده", friendsRemaining(commitment)],
  ];

  return (
    <section className="card card-hover overflow-hidden">
      <div className="flex flex-col gap-4 p-5 md:p-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-extrabold">{commitment.name}</h2>
            <Status value={provider} />
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
              وصول دوستان:
              <Status value={collection} />
            </span>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">سررسید: {commitment.dueDate || "ثبت نشده"}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-1.5 w-40 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${paidRatio}%` }} />
            </span>
            <span className="numbers text-[10px] text-[var(--muted)]">{formatPercent(paidRatio)} پرداخت شده</span>
          </div>
        </div>
        <button
          className="focus-ring inline-flex shrink-0 items-center gap-1 self-start rounded-lg px-2 py-1 text-xs font-bold text-[var(--accent-strong)] transition hover:bg-[var(--accent-soft)]"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? "بستن جزئیات" : "دیدن جزئیات"}
          <ChevronDown className={cn("transition", expanded && "rotate-180")} size={15} />
        </button>
      </div>

      <div className="grid grid-cols-2 border-t bg-[var(--surface-muted)] md:grid-cols-4 xl:grid-cols-7">
        {metrics.map(([label, value]) => (
          <div key={label} className="border-b border-l p-4 last:border-l-0 md:border-b-0">
            <p className="text-[10px] text-[var(--muted)]">{label}</p>
            <p className="numbers mt-2 truncate text-sm font-extrabold">{formatMoney(Number(value) * 10, unit)}</p>
          </div>
        ))}
      </div>

      {expanded && (
        <div className="p-5 md:p-6">
          <div className="mb-3 flex items-center gap-2">
            <UsersRound size={17} className="text-[var(--accent)]" />
            <h3 className="font-bold">وضعیت دوستان</h3>
          </div>

          {!commitment.receivables.length ? (
            <p className="rounded-[12px] bg-[var(--surface-muted)] p-4 text-xs text-[var(--muted)]">سهم دوستانی برای این تعهد ثبت نشده است.</p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[1fr_130px_130px_130px_110px_180px] gap-3 border-b pb-3 text-[10px] font-semibold text-[var(--muted)]">
                  <span>نام</span>
                  <span>سهم</span>
                  <span>دریافت‌شده</span>
                  <span>باقی‌مانده</span>
                  <span>وضعیت</span>
                  <span>ثبت پرداخت</span>
                </div>
                {commitment.receivables.map((friend) => {
                  const remaining = friendsRemaining({ ...commitment, receivables: [friend] });
                  const status = friendStatus(friend);
                  return (
                    <div key={friend.id} className="grid grid-cols-[1fr_130px_130px_130px_110px_180px] items-center gap-3 border-b py-3 text-xs last:border-b-0">
                      <strong className="truncate">{friend.name}</strong>
                      <span className="numbers">{formatMoney(friend.expected * 10, unit)}</span>
                      <span className="numbers">{formatMoney(friend.received * 10, unit)}</span>
                      <span className="numbers">{formatMoney(remaining * 10, unit)}</span>
                      <Status value={status} />
                      <div className="flex gap-1">
                        <input
                          aria-label={`مبلغ پرداخت ${friend.name}`}
                          className="control numbers h-9 w-24 text-[11px]"
                          type="number"
                          disabled={!remaining}
                          value={amounts[friend.id] ?? ""}
                          onChange={(event) => setAmounts({ ...amounts, [friend.id]: event.target.value })}
                          placeholder="تومان"
                        />
                        <button
                          disabled={!remaining}
                          onClick={() => {
                            const value = Math.min(remaining, money(amounts[friend.id] || String(remaining)));
                            if (value) {
                              onReceive(commitment.id, friend.id, value);
                              setAmounts({ ...amounts, [friend.id]: "" });
                            }
                          }}
                          className="focus-ring inline-flex h-9 items-center gap-1 rounded-[10px] bg-[var(--accent)] px-2.5 text-[10px] font-bold text-[var(--accent-contrast)] transition hover:bg-[var(--accent-strong)] disabled:opacity-45"
                        >
                          <Check size={13} />
                          ثبت
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
