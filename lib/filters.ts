import { getDateRange } from "@/lib/jalali-date";
import type { Filters, Transaction } from "@/lib/types";

export function filterTransactions(transactions: Transaction[], filters: Filters) {
  const range = getDateRange(filters.datePreset, new Date(), { start: filters.startDate, end: filters.endDate });
  const query = filters.search.trim().toLocaleLowerCase("fa");
  return transactions.filter((transaction) => {
    if (range.start && transaction.date < range.start) return false;
    if (range.end && transaction.date > range.end) return false;
    if (filters.account !== "all" && transaction.account.raw !== filters.account) return false;
    if (filters.category !== "all" && transaction.account.category !== filters.category) return false;
    if (filters.type !== "all" && transaction.account.type !== filters.type) return false;
    if (filters.currency !== "all" && transaction.originalUnit !== filters.currency) return false;
    if (query && !`${transaction.description} ${transaction.account.raw} ${transaction.account.categoryLabel}`.toLocaleLowerCase("fa").includes(query)) return false;
    return true;
  });
}
