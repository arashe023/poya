import { CircleDollarSign, HandCoins, Landmark, Scale, WalletCards } from "lucide-react";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { FinancialInsights } from "@/components/dashboard/financial-insights";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { MonthlyOverview } from "@/components/dashboard/monthly-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopExpenses } from "@/components/dashboard/top-expenses";
import { financialPosition } from "@/lib/financial-calculations";
import { formatMoney } from "@/lib/formatters";
import type { Commitment, CurrencyUnit, Transaction } from "@/lib/types";

export function Overview({ transactions, commitments, unit, onCategory, onTransactions, onSelect }: { transactions: Transaction[]; comparisonTransactions: Transaction[]; commitments: Commitment[]; unit: CurrencyUnit; onCategory: (key: string) => void; onTransactions: () => void; onSelect: (t: Transaction) => void }) {
  const position = financialPosition(transactions, commitments);
  return <div className="space-y-4">
    <section className="card p-5"><div className="mb-4"><h2 className="font-bold">وضعیت مالی</h2><p className="mt-1 text-xs text-[var(--muted)]">موجودی قابل خرج فقط پول نقد است؛ طلب دوستان دارایی غیرنقدی محسوب می‌شود.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="موجودی نقدی" value={formatMoney(position.cashBalance, unit)} hint="پول واقعی حساب‌های بانکی" icon={<WalletCards size={17}/>} /><StatCard label="موجودی قابل خرج" value={formatMoney(position.spendableBalance, unit)} hint="فقط پول نقد در دسترس" tone="positive" icon={<Scale size={17}/>} /><StatCard label="طلب از دوستان" value={formatMoney(position.totalReceivables, unit)} hint="دارایی غیرنقدی" tone="positive" icon={<HandCoins size={17}/>} /><StatCard label="بدهی‌های پرداخت‌نشده" value={formatMoney(position.totalLiabilities, unit)} hint="باقی‌مانده پرداخت به سرویس‌ها" tone="negative" icon={<Landmark size={17}/>} /><StatCard label="وضعیت خالص مالی" value={formatMoney(position.netPosition, unit)} hint="نقد + طلب − بدهی" icon={<CircleDollarSign size={17}/>} /></div></section><div className="grid gap-4 xl:grid-cols-3"><CashFlowChart transactions={transactions} unit={unit}/><CategoryChart transactions={transactions} unit={unit} type="expenses" title="هزینه بر اساس دسته‌بندی" onCategory={onCategory}/></div><div className="grid gap-4 xl:grid-cols-2"><IncomeExpenseChart transactions={transactions} unit={unit}/><CategoryChart transactions={transactions} unit={unit} type="income" title="درآمد بر اساس دسته‌بندی" onCategory={onCategory}/></div><MonthlyOverview transactions={transactions} unit={unit}/><div className="grid gap-4 xl:grid-cols-2"><TopExpenses transactions={transactions} unit={unit}/><RecentTransactions transactions={transactions} unit={unit} onAll={onTransactions} onSelect={onSelect}/></div><FinancialInsights transactions={transactions} unit={unit}/></div>;
}
