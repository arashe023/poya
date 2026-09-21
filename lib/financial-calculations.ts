import { formatJalaliMonth, JALALI_MONTHS, monthKey } from "@/lib/jalali-date";
import { toPersianNumber } from "@/lib/formatters";
import type { CategoryStats, Commitment, FinancialPosition, FriendReceivable, MonthlyStats, Transaction, TransactionType } from "@/lib/types";

export function totals(transactions: Transaction[]) {
  const income = transactions.filter((t) => t.account.type === "income").reduce((sum, t) => sum + Math.abs(t.amountIRR), 0);
  const expenses = transactions.filter((t) => t.account.type === "expenses").reduce((sum, t) => sum + Math.abs(t.amountIRR), 0);
  const balance = transactions.reduce((sum, t) => sum + t.amountIRR, 0);
  return { income, expenses, net: income - expenses, balance, count: transactions.length, savingsRate: income ? ((income - expenses) / income) * 100 : 0 };
}

export const remaining = (expected: number, received: number) => Math.max(0, expected - received);
export const paymentStatus = (expected: number, received: number) => received <= 0 ? "pending" : remaining(expected, received) > 0 ? "partially_paid" : "paid";
export const providerRemaining = (commitment: Commitment) => Math.max(0, commitment.totalDue - commitment.paidToProvider);
export const friendsExpected = (commitment: Commitment) => commitment.receivables.reduce((sum, friend) => sum + friend.expected, 0);
export const friendsReceived = (commitment: Commitment) => commitment.receivables.reduce((sum, friend) => sum + Math.min(friend.received, friend.expected), 0);
export const friendsRemaining = (commitment: Commitment) => commitment.receivables.reduce((sum, friend) => sum + remaining(friend.expected, friend.received), 0);
export const friendStatus = (friend: FriendReceivable) => paymentStatus(friend.expected, friend.received);
export const commitmentStatus = (commitment: Commitment) => paymentStatus(commitment.totalDue, commitment.paidToProvider);
export const collectionStatus = (commitment: Commitment) => paymentStatus(friendsExpected(commitment), friendsReceived(commitment));

export function financialPosition(transactions: Transaction[], commitments: Commitment[]): FinancialPosition {
  const bankTransactions = transactions.filter((transaction) => transaction.account.type === "assets" && ["bank", "cash"].includes(transaction.account.category));
  const transactionCash = bankTransactions.length ? bankTransactions.reduce((sum, transaction) => sum + transaction.amountIRR, 0) : totals(transactions).balance;
  const hasBankLedger = bankTransactions.length > 0;
  // Commitments are entered in تومان, while imported transactions are normalized to ریال.
  const paidToProviders = commitments.reduce((sum, commitment) => sum + Math.min(commitment.paidToProvider, commitment.totalDue), 0) * 10;
  const receivedFromFriends = commitments.reduce((sum, commitment) => sum + friendsReceived(commitment), 0) * 10;
  const cashBalance = hasBankLedger ? transactionCash : transactionCash - paidToProviders + receivedFromFriends;
  const totalReceivables = commitments.reduce((sum, commitment) => sum + friendsRemaining(commitment), 0) * 10;
  const totalLiabilities = commitments.reduce((sum, commitment) => sum + providerRemaining(commitment), 0) * 10;
  return { cashBalance, spendableBalance: cashBalance, totalReceivables, totalLiabilities, netPosition: cashBalance + totalReceivables - totalLiabilities };
}

export function groupByJalaliMonth(transactions: Transaction[]): MonthlyStats[] {
  const map = new Map<string, MonthlyStats>();
  transactions.forEach((transaction) => {
    const key = transaction.monthKey;
    const item = map.get(key) ?? { key, year: transaction.jalaliYear, month: transaction.jalaliMonth, label: formatJalaliMonth(transaction.jalaliYear, transaction.jalaliMonth), income: 0, expenses: 0, net: 0, savingsRate: 0, count: 0 };
    if (transaction.account.type === "income") item.income += Math.abs(transaction.amountIRR);
    if (transaction.account.type === "expenses") item.expenses += Math.abs(transaction.amountIRR);
    item.count += 1;
    map.set(key, item);
  });
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key)).map((item) => ({ ...item, net: item.income - item.expenses, savingsRate: item.income ? ((item.income - item.expenses) / item.income) * 100 : 0 }));
}

export const groupByJalaliYear = (transactions: Transaction[]) => Object.entries(Object.groupBy(transactions, (t) => String(t.jalaliYear)));
export const calculateMonthlyStats = groupByJalaliMonth;

export function categoryStats(transactions: Transaction[], type: TransactionType): CategoryStats[] {
  const map = new Map<string, { amount: number; count: number; label: string }>();
  transactions.filter((t) => t.account.type === type).forEach((t) => {
    const current = map.get(t.account.category) ?? { amount: 0, count: 0, label: t.account.categoryLabel };
    current.amount += Math.abs(t.amountIRR); current.count += 1; map.set(t.account.category, current);
  });
  const total = [...map.values()].reduce((sum, item) => sum + item.amount, 0);
  return [...map.entries()].map(([key, value]) => ({ key, ...value, percentage: total ? value.amount / total * 100 : 0 })).sort((a, b) => b.amount - a.amount);
}

export function previousMonthComparison(transactions: Transaction[]) {
  const groups = groupByJalaliMonth(transactions);
  if (!groups.length) return { income: 0, expenses: 0 };
  const current = groups.at(-1)!;
  const previousYear = current.month === 1 ? current.year - 1 : current.year;
  const previousMonth = current.month === 1 ? 12 : current.month - 1;
  const previous = groups.find((item) => item.year === previousYear && item.month === previousMonth);
  if (!previous) return { income: 0, expenses: 0 };
  const change = (a: number, b: number) => b ? ((a - b) / b) * 100 : 0;
  return { income: change(current.income, previous.income), expenses: change(current.expenses, previous.expenses) };
}

export function generateInsights(transactions: Transaction[]) {
  const months = groupByJalaliMonth(transactions);
  const latest = months.at(-1);
  if (!latest) return [];
  const previous = months.at(-2);
  const cats = categoryStats(transactions.filter((t) => t.monthKey === latest.key), "expenses");
  const maxExpenseMonth = [...months].sort((a, b) => b.expenses - a.expenses)[0];
  const incomeMonths = months.filter((m) => m.income > 0);
  const avgIncome = incomeMonths.reduce((sum, m) => sum + m.income, 0) / Math.max(1, incomeMonths.length);
  const items = [];
  if (previous?.expenses) items.push({ title: "تغییر هزینه", text: `هزینه‌های ${JALALI_MONTHS[latest.month - 1]} نسبت به ${JALALI_MONTHS[previous.month - 1]} ${toPersianNumber(Math.abs((latest.expenses - previous.expenses) / previous.expenses * 100).toFixed(1))}٪ ${latest.expenses >= previous.expenses ? "افزایش" : "کاهش"} داشته است.` });
  if (cats[0]) items.push({ title: "سهم اصلی هزینه", text: `${cats[0].label} با ${toPersianNumber(cats[0].percentage.toFixed(1))}٪ بیشترین سهم هزینه در آخرین ماه را داشته است.` });
  if (maxExpenseMonth) items.push({ title: "ماه پرهزینه", text: `بیشترین هزینه ثبت‌شده مربوط به ${maxExpenseMonth.label} است.` });
  items.push({ title: "میانگین درآمد", text: `میانگین درآمد ماهانه شما ${Math.round(avgIncome)} ریال است.` });
  items.push({ title: "نرخ پس‌انداز", text: `نرخ پس‌انداز در ${latest.label} برابر ${toPersianNumber(latest.savingsRate.toFixed(1))}٪ است.` });
  return items;
}
