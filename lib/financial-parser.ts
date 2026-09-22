import { parseAccount } from "@/lib/account-parser";
import { normalizeCurrency, toBaseRial } from "@/lib/currency";
import { toJalali } from "@/lib/jalali-date";
import type { Commitment, ImportedFinancialSummary, ImportResult, Liability, RawTransaction, Transaction } from "@/lib/types";

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
    id: raw.id ? String(raw.id) : `${originalDate}-${String(raw.txnidx ?? index)}-${index}`,
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

interface LedgerPosting { account?: unknown; amount?: unknown; commodity?: unknown; direction?: unknown }
interface LedgerTransaction { id?: unknown; date?: unknown; description?: unknown; comment?: unknown; tags?: unknown; postings?: unknown; amount?: unknown; commodity?: unknown; currency?: unknown; type?: unknown; category?: unknown; status?: unknown }
interface ApiCommitment { id?: unknown; name?: unknown; total_due?: unknown; paid_to_commitment?: unknown; next_due_date?: unknown; currency?: unknown; friends_share?: unknown; status?: unknown }
interface ApiLiability { id?: unknown; name?: unknown; account?: unknown; total_due?: unknown; paid?: unknown; remaining?: unknown; currency?: unknown; status?: unknown }

function asRecords(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : []; }
function asRecord(value: unknown): Record<string, unknown> | null { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function numberValue(value: unknown) { const result = typeof value === "number" ? value : Number(String(value ?? "").replaceAll(",", "")); return Number.isFinite(result) ? result : 0; }
function ledgerRawTransactions(items: Record<string, unknown>[]) {
  return items.map((item, transactionIndex): RawTransaction => {
    const transaction = item as LedgerTransaction;
    const postings = asRecords(transaction.postings) as LedgerPosting[];
    if (!postings.length) return item as RawTransaction;

    const typed = postings.map((posting) => ({
      posting,
      account: parseAccount(String(posting.account ?? "")),
      amount: numberValue(posting.amount),
    }));
    const typeHint = String(transaction.type ?? "").toLowerCase();
    const expense = typed.find((line) => line.account.type === "expenses");
    const income = typed.find((line) => line.account.type === "income");
    const liability = typed.find((line) => line.account.type === "liabilities");
    const positiveAsset = typed.find((line) => line.account.type === "assets" && line.amount > 0);
    const negativeAsset = typed.find((line) => line.account.type === "assets" && line.amount < 0);

    let primary = expense ?? income ?? liability ?? positiveAsset ?? negativeAsset ?? typed[0];
    if (typeHint === "income") primary = income ?? primary;
    if (typeHint === "expense" || typeHint === "expenses") primary = expense ?? primary;
    if (typeHint === "installment" || typeHint === "liability") primary = liability ?? primary;

    const hintedCategory = String(transaction.category ?? "").trim();
    const fallbackAccount = typeHint === "income" && hintedCategory
      ? `income:${hintedCategory}`
      : (typeHint === "expense" || typeHint === "expenses") && hintedCategory
        ? `expenses:${hintedCategory}`
        : undefined;
    const account = primary?.posting.account ?? fallbackAccount;
    const explicitAmount = transaction.amount === undefined ? 0 : Math.abs(numberValue(transaction.amount));
    const derivedAmount = expense
      ? Math.abs(expense.amount)
      : income
        ? Math.abs(positiveAsset?.amount ?? income.amount)
        : liability
          ? Math.abs(liability.amount)
          : Math.abs(primary?.amount ?? 0);
    const commodity = transaction.currency ?? transaction.commodity ?? primary?.posting.commodity ?? postings.find((posting) => posting.commodity)?.commodity;
    const stableId = String(transaction.id ?? `${String(transaction.date ?? "unknown")}-ledger-${transactionIndex}`);

    return {
      ...item,
      id: stableId,
      date: transaction.date,
      description: transaction.description,
      comment: transaction.comment,
      tags: transaction.tags,
      status: transaction.status,
      account,
      amount: explicitAmount || derivedAmount,
      commodity,
      txnidx: stableId,
      postings,
    };
  });
}

function objectTransactions(value: unknown) {
  const items = asRecords(value);
  const containsPostings = items.some((item) => Array.isArray(item.postings));
  return containsPostings ? ledgerRawTransactions(items) : items as RawTransaction[];
}

function currencyFactor(value: unknown) {
  const currency = String(value ?? "TOMAN").toUpperCase();
  return currency === "IRR" || currency === "RIAL" ? 10 : 1;
}

function parseLiabilities(value: unknown, defaultCurrency: unknown): Liability[] {
  return asRecords(value).map((item, index) => {
    const liability = item as ApiLiability;
    const unit = normalizeCurrency(liability.currency ?? defaultCurrency) ?? "IRT";
    const factor = currencyFactor(liability.currency ?? defaultCurrency);
    const totalDue = numberValue(liability.total_due) / factor;
    const paid = Math.min(totalDue, numberValue(liability.paid) / factor);
    return {
      id: String(liability.id ?? `liability-${index}`),
      name: String(liability.name ?? liability.id ?? "بدهی"),
      account: String(liability.account ?? ""),
      totalDue,
      paid,
      remaining: liability.remaining === undefined ? Math.max(0, totalDue - paid) : numberValue(liability.remaining) / factor,
      currency: unit,
      status: String(liability.status ?? "active"),
    };
  });
}

function apiCommitments(value: unknown, liabilities: Liability[], defaultCurrency: unknown): Commitment[] {
  const liabilityById = new Map(liabilities.map((liability) => [liability.id, liability]));
  const commitments = asRecords(value).map((item, index): Commitment => {
    const commitment = item as ApiCommitment;
    const id = String(commitment.id ?? `commitment-${index}`);
    const liability = liabilityById.get(id);
    const factor = currencyFactor(commitment.currency ?? liability?.currency ?? defaultCurrency);
    const friendsShare = asRecord(commitment.friends_share);
    const receivables = asRecords(friendsShare?.by_friend).map((friend, friendIndex) => {
      const expected = numberValue(friend.expected) / factor;
      return {
        id: String(friend.id ?? `friend-${friendIndex}`),
        name: String(friend.name ?? friend.id ?? `دوست ${friendIndex + 1}`),
        expected,
        received: Math.min(expected, numberValue(friend.received) / factor),
      };
    });
    const totalDue = commitment.total_due === undefined ? liability?.totalDue ?? 0 : numberValue(commitment.total_due) / factor;
    const paidToProvider = commitment.paid_to_commitment === undefined ? liability?.paid ?? 0 : numberValue(commitment.paid_to_commitment) / factor;
    const friendsTotal = receivables.reduce((sum, friend) => sum + friend.expected, 0);
    return {
      id,
      name: String(commitment.name ?? liability?.name ?? commitment.id ?? "تعهد گروهی"),
      totalDue,
      paidToProvider: Math.min(totalDue, paidToProvider),
      dueDate: String(commitment.next_due_date ?? ""),
      myShare: friendsShare?.own_share === undefined ? Math.max(0, totalDue - friendsTotal) : numberValue(friendsShare.own_share) / factor,
      receivables,
    };
  });

  const commitmentIds = new Set(commitments.map((commitment) => commitment.id));
  liabilities.forEach((liability) => {
    if (commitmentIds.has(liability.id)) return;
    commitments.push({
      id: liability.id,
      name: liability.name,
      totalDue: liability.totalDue,
      paidToProvider: liability.paid,
      dueDate: "",
      myShare: liability.totalDue,
      receivables: [],
    });
  });
  return commitments;
}

function parseSummary(value: unknown, defaultCurrency: unknown): ImportedFinancialSummary | undefined {
  const summary = asRecord(value);
  if (!summary) return undefined;
  const currency = normalizeCurrency(summary.currency ?? defaultCurrency) ?? "IRT";
  return {
    income: numberValue(summary.income),
    expense: numberValue(summary.expense),
    net: numberValue(summary.net),
    transactionCount: numberValue(summary.transaction_count),
    currency,
  };
}

export function parseFinancialJson(input: string): ImportResult {
  let parsed: unknown;
  try { parsed = JSON.parse(input); } catch {
    throw new Error("ساختار JSON نادرست است. ویرگول‌ها، کوتیشن‌ها و براکت‌ها را بررسی کنید.");
  }
  const exportObject = asRecord(parsed);
  const rootTransactions = exportObject?.transactions;
  const rootCommitments = exportObject?.commitments;
  const rootLiabilities = exportObject?.liabilities;
  const hasTransactions = Array.isArray(rootTransactions);
  const hasCommitments = Array.isArray(rootCommitments);
  const hasLiabilities = Array.isArray(rootLiabilities);
  const source = Array.isArray(parsed)
    ? parsed
    : Array.isArray(rootTransactions)
      ? objectTransactions(rootTransactions)
      : [];

  if (!Array.isArray(parsed) && !hasTransactions && !hasCommitments && !hasLiabilities) {
    throw new Error("در ریشهٔ JSON هیچ‌کدام از آرایه‌های transactions، commitments یا liabilities پیدا نشد.");
  }
  const valid: Transaction[] = [];
  const invalid: ImportResult["invalid"] = [];
  source.forEach((item, index) => {
    try { valid.push(parseTransaction(item as RawTransaction, index)); }
    catch (error) { invalid.push({ index, reason: error instanceof Error ? error.message : "رکورد نامعتبر", raw: item }); }
  });
  const defaultCurrency = exportObject?.currency;
  const liabilities = parseLiabilities(rootLiabilities, defaultCurrency);
  const commitments = apiCommitments(rootCommitments, liabilities, defaultCurrency);
  const summary = parseSummary(exportObject?.summary, defaultCurrency);
  if (!valid.length && !invalid.length && !commitments.length) {
    throw new Error("فایل معتبر است، اما هیچ تراکنش یا تعهدی برای ورود ندارد.");
  }
  return {
    valid,
    invalid,
    commitments: commitments.length ? commitments : undefined,
    liabilities: liabilities.length ? liabilities : undefined,
    summary,
  };
}
