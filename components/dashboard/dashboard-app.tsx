"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AccountTree } from "@/components/accounts/account-tree";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { CommitmentsView } from "@/components/commitments/commitments-view";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FinancialInsights } from "@/components/dashboard/financial-insights";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { MonthlyOverview } from "@/components/dashboard/monthly-overview";
import { Overview } from "@/components/dashboard/overview";
import { Sidebar } from "@/components/dashboard/sidebar";
import { EmptyState } from "@/components/ui/empty-state";
import { JsonImportDialog } from "@/components/import/json-import-dialog";
import { ImportSummary } from "@/components/import/import-summary";
import { SettingsView } from "@/components/settings/settings-view";
import { TransactionDetails } from "@/components/transactions/transaction-details";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { parseTransaction } from "@/lib/financial-parser";
import { filterTransactions } from "@/lib/filters";
import { createSampleData } from "@/lib/sample-data";
import { translateAccountSegment } from "@/lib/account-parser";
import type { Commitment, CurrencyUnit, DashboardView, Filters, ImportResult, RawTransaction, ThemeMode, Transaction } from "@/lib/types";

const STORAGE_KEY = "poya-finance-transactions-v1";
const COMMITMENTS_STORAGE_KEY = "poya-finance-commitments-v1";
const THEME_KEY = "poya-finance-theme";
const initialFilters: Filters = { datePreset: "all", account: "all", category: "all", type: "all", currency: "all", search: "" };
const titles: Record<DashboardView, string> = { overview: "نمای کلی", transactions: "تراکنش‌ها", accounts: "حساب‌ها", commitments: "تعهدهای گروهی", reports: "گزارش‌های مالی", import: "ورود اطلاعات", settings: "تنظیمات" };

export function DashboardApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [unit, setUnit] = useState<CurrencyUnit>("IRT");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [view, setView] = useState<DashboardView>("overview");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [importOpen, setImportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [lastImport, setLastImport] = useState<ImportResult | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const raw = JSON.parse(stored) as RawTransaction[];
        setTransactions(raw.map((item, index) => parseTransaction(item, index)));
      }
      const storedCommitments = localStorage.getItem(COMMITMENTS_STORAGE_KEY);
      if (storedCommitments) setCommitments(JSON.parse(storedCommitments) as Commitment[]);
      const savedTheme = localStorage.getItem(THEME_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const validTheme = savedTheme === "light" || savedTheme === "dark" || savedTheme === "midnight";
      setTheme(validTheme ? savedTheme : prefersDark ? "dark" : "light");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "midnight");
    if (theme !== "light") document.documentElement.classList.add(theme);
    if (hydrated) localStorage.setItem(THEME_KEY, theme);
  }, [theme, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions.map((t) => t.raw)));
  }, [transactions, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(COMMITMENTS_STORAGE_KEY, JSON.stringify(commitments));
  }, [commitments, hydrated]);

  const filtered = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
  const comparisonTransactions = useMemo(() => filterTransactions(transactions, { ...filters, datePreset: "all", startDate: undefined, endDate: undefined }), [transactions, filters]);
  const accounts = useMemo(() => [...new Set(transactions.map((t) => t.account.raw))].sort(), [transactions]);
  const categories = useMemo(
    () => [...new Map(transactions.map((t) => [t.account.category, { key: t.account.category, label: translateAccountSegment(t.account.category) }])).values()].sort((a, b) => a.label.localeCompare(b.label, "fa")),
    [transactions],
  );
  const hasActiveFilters = filters.datePreset !== "all" || filters.account !== "all" || filters.category !== "all" || filters.type !== "all" || filters.currency !== "all" || filters.search.trim() !== "";

  const handleImport = (incoming: Transaction[], result: ImportResult) => {
    const combined = new Map(transactions.map((t) => [t.id, t]));
    incoming.forEach((t) => combined.set(t.id, t));
    setTransactions([...combined.values()]);
    if (result.commitments?.length) {
      const combinedCommitments = new Map(commitments.map((commitment) => [commitment.id, commitment]));
      result.commitments.forEach((commitment) => combinedCommitments.set(commitment.id, commitment));
      setCommitments([...combinedCommitments.values()]);
    }
    setLastImport(result);
    setView("overview");
  };
  const loadSample = () => {
    const sample = createSampleData().map((item, index) => parseTransaction(item, index));
    setTransactions(sample);
    setLastImport({ valid: sample, invalid: [] });
    setView("overview");
  };
  const goCategory = (key: string) => setFilters({ ...filters, category: key });

  const content = () => {
    if (!transactions.length && view !== "import" && view !== "settings") return <EmptyState onImport={() => setImportOpen(true)} onSample={loadSample} />;
    if (view === "overview") return <Overview transactions={filtered} comparisonTransactions={comparisonTransactions} commitments={commitments} unit={unit} onCategory={goCategory} onTransactions={() => setView("transactions")} onSelect={setSelected} />;
    if (view === "transactions") return <TransactionTable transactions={filtered} unit={unit} filters={filters} setFilters={setFilters} accounts={accounts} categories={categories} onSelect={setSelected} />;
    if (view === "accounts") return <AccountTree transactions={filtered} unit={unit} />;
    if (view === "commitments") return <CommitmentsView commitments={commitments} unit={unit} onChange={setCommitments} />;
    if (view === "reports")
      return (
        <div className="space-y-4">
          <FinancialInsights transactions={filtered} unit={unit} />
          <div className="grid gap-4 xl:grid-cols-2">
            <CashFlowChart transactions={filtered} unit={unit} />
            <IncomeExpenseChart transactions={filtered} unit={unit} />
          </div>
          <MonthlyOverview transactions={filtered} unit={unit} />
        </div>
      );
    if (view === "import") return <JsonImportDialog open onOpenChange={() => undefined} onImport={handleImport} embedded />;
    return (
      <SettingsView
        transactions={transactions}
        commitments={commitments}
        theme={theme}
        setTheme={setTheme}
        onClear={() => {
          setTransactions([]);
          setCommitments([]);
          setFilters(initialFilters);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(COMMITMENTS_STORAGE_KEY);
        }}
      />
    );
  };

  return (
    <div className="app-shell min-h-[100dvh] bg-[var(--background)]">
      <Sidebar view={view} onViewChange={setView} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:mr-[252px]">
        <DashboardHeader
          title={titles[view]}
          unit={unit}
          setUnit={setUnit}
          theme={theme}
          setTheme={setTheme}
          filters={filters}
          setFilters={setFilters}
          accounts={accounts}
          categories={categories}
          onImport={() => setImportOpen(true)}
          onMenu={() => setMenuOpen(true)}
          onResetFilters={() => setFilters(initialFilters)}
          hasActiveFilters={hasActiveFilters}
          resultCount={filtered.length}
        />
        <main id="main-content" className="mx-auto max-w-[1600px] p-4 md:p-6 xl:p-8">
          {lastImport && (
            <div
              role="status"
              className="mb-4 flex items-start gap-3 rounded-[14px] border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-3.5 text-[var(--accent-strong)]"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/12">
                <CheckCircle2 size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <strong className="text-xs font-bold">ورود اطلاعات انجام شد</strong>
                <p className="mt-1 text-[11px] leading-6">
                  {lastImport.valid.length.toLocaleString("fa-IR")} تراکنش
                  {lastImport.commitments?.length ? ` و ${lastImport.commitments.length.toLocaleString("fa-IR")} تعهد گروهی` : ""}
                  {" با موفقیت وارد شد و "}
                  {lastImport.invalid.length.toLocaleString("fa-IR")} رکورد نامعتبر نادیده گرفته شد.
                </p>
                {lastImport.invalid.length > 0 && (
                  <details className="mt-2 max-w-xl">
                    <summary className="cursor-pointer text-[11px] font-semibold underline">مشاهده جزئیات خطاها</summary>
                    <div className="mt-2">
                      <ImportSummary result={lastImport} />
                    </div>
                  </details>
                )}
              </div>
              <button aria-label="بستن اعلان" onClick={() => setLastImport(null)} className="rounded-lg p-1.5 transition hover:bg-[var(--accent)]/12">
                <X size={16} />
              </button>
            </div>
          )}
          {!hydrated ? <DashboardSkeleton /> : content()}
        </main>
      </div>
      <JsonImportDialog open={importOpen} onOpenChange={setImportOpen} onImport={handleImport} />
      <TransactionDetails transaction={selected} unit={unit} onClose={() => setSelected(null)} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="card p-4 md:p-5">
        <div className="skeleton h-5 w-40 rounded-full" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-[124px] rounded-[16px]" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="skeleton h-[380px] rounded-[16px] xl:col-span-2" />
        <div className="skeleton h-[380px] rounded-[16px]" />
      </div>
    </div>
  );
}
