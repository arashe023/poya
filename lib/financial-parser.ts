import { parseAccount } from "@/lib/account-parser";
import { normalizeCurrency, toBaseRial } from "@/lib/currency";
import { toJalali } from "@/lib/jalali-date";
import type { Commitment, ImportResult, RawTransaction, Transaction } from "@/lib/types";

function numericAmount(raw: RawTransaction) {
  const candidates = [raw.amount, raw.credit, raw.debit];
  for (const value of candidates) {
    if (value === "" || value === null || value === undefined) continue;
    const number = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
    if (Number.isFinite(number)) return number;
  }
  return null;
}

export function parseTransaction(raw: RawTransaction, index = 0): Transaction {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("رکورد باید یک شیء باشد");
  const originalDate = String(raw.date ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(originalDate)) throw new Error("تاریخ ISO معتبر نیست");
  const amount = numericAmount(raw);
  if (amount === null) throw new Error("مبلغ معتبر نیست");
  const unit = normalizeCurrency(raw.commodity);
  if (!unit) throw new Error("واحد پول پشتیبانی نمی‌شود");
  const accountRaw = String(raw.account ?? "").trim();
  if (!accountRaw) throw new Error("حساب خالی است");
  const jalali = toJalali(originalDate);
  const account = parseAccount(accountRaw);
  const normalizedAmount = account.type === "expenses" ? -Math.abs(amount) : account.type === "income" ? Math.abs(amount) : amount;
  return {
    id: `${originalDate}-${String(raw.txnidx ?? index)}-${index}`,
    ...jalali,
    amount: normalizedAmount,
    amountIRR: toBaseRial(normalizedAmount, unit),
    originalUnit: unit,
    description: String(raw.description ?? "بدون شرح").trim() || "بدون شرح",
    account,
    status: String(raw.status || raw["posting-status"] || "ثبت‌شده").trim(),
    comment: String(raw.comment || raw["posting-comment"] || "").trim(),
    raw,
  };
}

interface LedgerPosting { account?: unknown; amount?: unknown; commodity?: unknown }
interface LedgerTransaction { date?: unknown; description?: unknown; comment?: unknown; tags?: unknown; postings?: unknown }
interface CommitmentSchedule { id?: unknown; name?: unknown; total?: unknown; first_due?: unknown; currency?: unknown; shares?: unknown; payments?: unknown; receipts?: unknown }

function asRecords(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : []; }
function asRecord(value: unknown): Record<string, unknown> | null { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function numberValue(value: unknown) { const result = typeof value === "number" ? value : Number(String(value ?? "").replaceAll(",", "")); return Number.isFinite(result) ? result : 0; }
function ledgerRawTransactions(items: Record<string, unknown>[]) {
  const raw: RawTransaction[] = [];
  items.forEach((item, transactionIndex) => {
    const transaction = item as LedgerTransaction;
    asRecords(transaction.postings).forEach((posting, postingIndex) => {
      const line = posting as LedgerPosting;
      if (!line.account || line.amount === undefined || !line.commodity) return;
      raw.push({ date: transaction.date, description: transaction.description, comment: transaction.comment, tags: transaction.tags, account: line.account, amount: line.amount, commodity: line.commodity, txnidx: `ledger-${transactionIndex}-${postingIndex}` });
    });
  });
  return raw;
}

function objectTransactions(value: unknown) {
  const items = asRecords(value);
  const containsPostings = items.some((item) => Array.isArray(item.postings));
  return containsPostings ? ledgerRawTransactions(items) : items as RawTransaction[];
}

function schedulesToCommitments(value: unknown): Commitment[] {
  return asRecords(value).map((item, index) => {
    const schedule = item as CommitmentSchedule;
    const currency = String(schedule.currency ?? "IRR").toUpperCase();
    const factor = currency === "IRR" || currency === "RIAL" ? 10 : 1;
    const receipts = asRecords(schedule.receipts);
    const payments = asRecords(schedule.payments);
    const receivables = asRecords(schedule.shares).map((share, shareIndex) => {
      const friendId = String(share.id ?? `friend-${shareIndex}`);
      const expected = numberValue(share.expected) / factor;
      const received = receipts.filter((receipt) => String(receipt.friend ?? "") === friendId).reduce((sum, receipt) => sum + numberValue(receipt.amount) / factor, 0);
      return { id: friendId, name: String(share.name ?? friendId), expected, received: Math.min(expected, received) };
    });
    const totalDue = numberValue(schedule.total) / factor;
    const friendsTotal = receivables.reduce((sum, friend) => sum + friend.expected, 0);
    return { id: String(schedule.id ?? `commitment-${index}`), name: String(schedule.name ?? schedule.id ?? "تعهد گروهی"), totalDue, paidToProvider: Math.min(totalDue, payments.reduce((sum, payment) => sum + numberValue(payment.amount) / factor, 0)), dueDate: String(schedule.first_due ?? ""), myShare: Math.max(0, totalDue - friendsTotal), receivables };
  });
}

export function parseFinancialJson(input: string): ImportResult {
  let parsed: unknown;
  try { parsed = JSON.parse(input); } catch {
    throw new Error("ساختار JSON نادرست است. ویرگول‌ها، کوتیشن‌ها و براکت‌ها را بررسی کنید.");
  }
  const exportObject = asRecord(parsed);
  const journal = asRecord(exportObject?.journal);
  const rootTransactions = exportObject?.transactions;
  const journalTransactions = journal?.transactions;
  const schedules = exportObject?.commitment_schedules ?? journal?.commitment_schedules;
  const hasTransactions = Array.isArray(rootTransactions) || Array.isArray(journalTransactions);
  const hasCommitments = Array.isArray(schedules);
  const source = Array.isArray(parsed)
    ? parsed
    : Array.isArray(rootTransactions)
      ? objectTransactions(rootTransactions)
      : Array.isArray(journalTransactions)
        ? objectTransactions(journalTransactions)
        : [];

  if (!Array.isArray(parsed) && !hasTransactions && !hasCommitments) {
    throw new Error("در این فایل آرایهٔ transactions یا commitment_schedules پیدا نشد؛ این بخش‌ها می‌توانند در ریشه یا داخل journal باشند.");
  }
  const valid: Transaction[] = [];
  const invalid: ImportResult["invalid"] = [];
  source.forEach((item, index) => {
    try { valid.push(parseTransaction(item as RawTransaction, index)); }
    catch (error) { invalid.push({ index, reason: error instanceof Error ? error.message : "رکورد نامعتبر", raw: item }); }
  });
  const commitments = schedulesToCommitments(schedules);
  if (!valid.length && !invalid.length && !commitments.length) {
    throw new Error("فایل معتبر است، اما هیچ تراکنش یا تعهدی برای ورود ندارد.");
  }
  return { valid, invalid, commitments: commitments.length ? commitments : undefined };
}
