export type CurrencyUnit = "IRR" | "IRT";
export type ThemeMode = "light" | "dark" | "midnight";
export type TransactionType = "income" | "expenses" | "assets" | "liabilities" | "equity" | "other";
export type DashboardView = "overview" | "transactions" | "accounts" | "commitments" | "reports" | "import" | "settings";
export type DatePreset = "thisMonth" | "lastMonth" | "threeMonths" | "sixMonths" | "thisYear" | "lastYear" | "all" | "custom";

export interface RawTransaction {
  date2?: unknown;
  amount?: unknown;
  txnidx?: unknown;
  credit?: unknown;
  description?: unknown;
  status?: unknown;
  code?: unknown;
  account?: unknown;
  date?: unknown;
  commodity?: unknown;
  debit?: unknown;
  "posting-status"?: unknown;
  "posting-comment"?: unknown;
  comment?: unknown;
  [key: string]: unknown;
}

export interface AccountInfo {
  raw: string;
  segments: string[];
  type: TransactionType;
  category: string;
  subcategory?: string;
  typeLabel: string;
  categoryLabel: string;
  subcategoryLabel?: string;
}

export interface JalaliDateInfo {
  originalDate: string;
  date: Date;
  jalaliDate: string;
  jalaliYear: number;
  jalaliMonth: number;
  jalaliDay: number;
  monthKey: string;
}

export interface Transaction extends JalaliDateInfo {
  id: string;
  amount: number;
  amountIRR: number;
  originalUnit: CurrencyUnit;
  description: string;
  account: AccountInfo;
  status: string;
  comment: string;
  raw: RawTransaction;
}

export interface InvalidRecord {
  index: number;
  reason: string;
  raw: unknown;
}

export interface ImportResult {
  valid: Transaction[];
  invalid: InvalidRecord[];
  commitments?: Commitment[];
}

export interface Filters {
  datePreset: DatePreset;
  startDate?: string;
  endDate?: string;
  account: string;
  category: string;
  type: TransactionType | "all";
  currency: CurrencyUnit | "all";
  search: string;
}

export interface MonthlyStats {
  key: string;
  year: number;
  month: number;
  label: string;
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
  count: number;
}

export interface CategoryStats {
  key: string;
  label: string;
  amount: number;
  percentage: number;
  count: number;
}

export type PaymentStatus = "pending" | "partially_paid" | "paid";

export interface FriendReceivable {
  id: string;
  name: string;
  expected: number;
  received: number;
}

export interface Commitment {
  id: string;
  name: string;
  totalDue: number;
  paidToProvider: number;
  dueDate: string;
  myShare: number;
  receivables: FriendReceivable[];
}

export interface FinancialPosition {
  cashBalance: number;
  spendableBalance: number;
  totalReceivables: number;
  totalLiabilities: number;
  netPosition: number;
}
