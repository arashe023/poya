"use client";

import { CheckCircle2, CloudDownload, ExternalLink, Link2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { parseFinancialJson } from "@/lib/financial-parser";
import { toPersianNumber } from "@/lib/formatters";
import type { ImportResult, Transaction } from "@/lib/types";

const SOURCE_KEY = "poya-finance-remote-source-v1";
const MAX_REMOTE_BYTES = 20 * 1024 * 1024;

interface SavedRemoteSource {
  url: string;
  syncedAt?: string;
}

export function RemoteJsonSource({
  onText,
  onImport,
}: {
  onText: (text: string) => void;
  onImport: (transactions: Transaction[], result: ImportResult) => void;
}) {
  const [url, setUrl] = useState("");
  const [syncedAt, setSyncedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SOURCE_KEY);
      if (!stored) return;
      const saved = JSON.parse(stored) as SavedRemoteSource;
      setUrl(typeof saved.url === "string" ? saved.url : "");
      setSyncedAt(typeof saved.syncedAt === "string" ? saved.syncedAt : "");
    } catch {
      localStorage.removeItem(SOURCE_KEY);
    }
  }, []);

  const saveSource = (nextUrl: string, nextSyncedAt?: string) => {
    localStorage.setItem(SOURCE_KEY, JSON.stringify({ url: nextUrl, syncedAt: nextSyncedAt } satisfies SavedRemoteSource));
  };

  const sync = async () => {
    setError("");
    setSuccess("");
    const normalizedUrl = url.trim();
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      setError("یک لینک کامل با http یا https وارد کنید.");
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(parsedUrl.toString(), {
        cache: "no-store",
        credentials: "omit",
        headers: { Accept: "application/json" },
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`سرور با کد ${toPersianNumber(response.status)} پاسخ داد.`);
      const declaredSize = Number(response.headers.get("content-length") ?? 0);
      if (declaredSize > MAX_REMOTE_BYTES) throw new Error("حجم پاسخ بیشتر از ۲۰ مگابایت است.");

      const body = (await response.text()).replace(/^\uFEFF/, "");
      if (new Blob([body]).size > MAX_REMOTE_BYTES) throw new Error("حجم پاسخ بیشتر از ۲۰ مگابایت است.");
      const result = parseFinancialJson(body);
      const importedCount = result.valid.length + (result.commitments?.length ?? 0);
      const now = new Date().toISOString();

      onText(body);
      onImport(result.valid, result);
      setSyncedAt(now);
      setSuccess(`${toPersianNumber(importedCount)} مورد از لینک دریافت و وارد شد.`);
      saveSource(parsedUrl.toString(), now);
    } catch (syncError) {
      if (syncError instanceof DOMException && syncError.name === "AbortError") {
        setError("زمان دریافت پاسخ تمام شد. اتصال یا آدرس لینک را بررسی کنید.");
      } else if (syncError instanceof TypeError) {
        setError("دریافت از لینک ممکن نشد. لینک باید عمومی باشد و سرور آن دسترسی CORS را مجاز کرده باشد.");
      } else {
        setError(syncError instanceof Error ? syncError.message : "دریافت JSON از لینک انجام نشد.");
      }
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  const lastSyncLabel = syncedAt
    ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(syncedAt))
    : "هنوز همگام‌سازی نشده";

  return (
    <section className="mt-5 rounded-[14px] border bg-[var(--surface-muted)] p-3.5 md:p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
          <Link2 size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold">همگام‌سازی از لینک JSON</h3>
          <p className="mt-1 text-[10.5px] leading-5 text-[var(--muted)]">لینک عمومی را یک‌بار ثبت کنید؛ دفعات بعد با همان دکمه آخرین مقادیر دریافت و جایگزین رکوردهای هم‌شناسه می‌شوند.</p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <ExternalLink size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="url"
            dir="ltr"
            aria-label="لینک JSON"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setError("");
              setSuccess("");
            }}
            onBlur={() => url.trim() && saveSource(url.trim(), syncedAt || undefined)}
            placeholder="https://example.com/finance.json"
            className="control w-full pl-9 text-left"
          />
        </label>
        <Button onClick={() => void sync()} disabled={loading || !url.trim()} className="shrink-0">
          {loading ? <RefreshCw size={15} className="animate-spin" /> : syncedAt ? <RefreshCw size={15} /> : <CloudDownload size={15} />}
          {loading ? "در حال دریافت" : syncedAt ? "به‌روزرسانی از لینک" : "دریافت و ورود"}
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-[var(--muted)]">
        <span>آخرین دریافت: {lastSyncLabel}</span>
        <span>دریافت مستقیم در مرورگر · حداکثر ۲۰ مگابایت</span>
      </div>

      {error && <p role="alert" className="mt-3 rounded-[10px] bg-[var(--danger-soft)] px-3 py-2 text-[11px] text-[var(--danger)]">{error}</p>}
      {success && (
        <p role="status" className="mt-3 flex items-center gap-2 rounded-[10px] bg-[var(--accent-soft)] px-3 py-2 text-[11px] text-[var(--accent-strong)]">
          <CheckCircle2 size={14} />
          {success}
        </p>
      )}
    </section>
  );
}
