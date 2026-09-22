"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { FileJson, HardDrive, Trash2, Upload, X } from "lucide-react";
import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImportSummary } from "@/components/import/import-summary";
import { JsonEditor } from "@/components/import/json-editor";
import { parseFinancialJson } from "@/lib/financial-parser";
import { sampleJson } from "@/lib/sample-data";
import { toPersianNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ImportResult, Transaction } from "@/lib/types";

export function JsonImportDialog({
  open,
  onOpenChange,
  onImport,
  embedded = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (transactions: Transaction[], result: ImportResult) => void;
  embedded?: boolean;
}) {
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [dropError, setDropError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const analysis = useMemo(() => {
    if (!text.trim()) return { result: null as ImportResult | null, error: "" };
    try {
      return { result: parseFinancialJson(text), error: "" };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : "JSON نامعتبر است" };
    }
  }, [text]);

  const readFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setText("");
      setDropError("حجم فایل بیش از ۲۰ مگابایت است.");
      return;
    }
    setDropError("");
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setDropError("حجم فایل بیش از ۲۰ مگابایت است.");
      return;
    }
    setDropError("");
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  const validCount = analysis.result?.valid.length ?? 0;
  const commitmentCount = analysis.result?.commitments?.length ?? 0;
  const importableCount = validCount + commitmentCount;

  /* Radix only allows `Dialog.Title` / `Dialog.Description` inside a `Dialog.Root`.
     The embedded view renders the same markup without the dialog wrapper, so it
     uses plain headings instead. */
  const heading = embedded ? (
    <div>
      <h2 className="font-bold">ورود اطلاعات مالی</h2>
      <p className="mt-0.5 text-xs text-[var(--muted)]">فایل JSON یا متن خروجی hledger را وارد کنید.</p>
    </div>
  ) : (
    <div>
      <Dialog.Title className="font-bold">ورود اطلاعات مالی</Dialog.Title>
      <Dialog.Description className="mt-0.5 text-xs text-[var(--muted)]">فایل JSON یا متن خروجی hledger را وارد کنید.</Dialog.Description>
    </div>
  );

  const content = (
    <div className={embedded ? "card p-4 md:p-6" : ""}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="soft-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]">
            <FileJson size={18} />
          </span>
          {heading}
        </div>
        {!embedded && (
          <Dialog.Close asChild>
            <button aria-label="بستن" className="icon-button h-9 w-9">
              <X size={17} />
            </button>
          </Dialog.Close>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "mt-5 flex flex-wrap items-center gap-2 rounded-[13px] border border-dashed p-3 transition",
          dragging ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border-strong)] bg-[var(--surface-muted)]",
        )}
      >
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={readFile} />
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload size={14} />
          انتخاب فایل
        </Button>
        <Button variant="outline" size="sm" onClick={() => setText(sampleJson())}>
          <FileJson size={14} />
          اطلاعات نمونه
        </Button>
        <Button variant="ghost" size="sm" disabled={!text} onClick={() => setText("")}>
          <Trash2 size={14} />
          پاک کردن متن
        </Button>
        <span className="mr-auto hidden text-[10.5px] text-[var(--muted)] sm:block">یا فایل JSON را همین‌جا رها کنید</span>
      </div>

      {(dropError || analysis.error) && (
        <p className="mt-2 rounded-[10px] bg-[var(--danger-soft)] px-3 py-2 text-[11px] text-[var(--danger)]">{dropError || analysis.error}</p>
      )}

      <div className="mt-4">
        <JsonEditor value={text} onChange={setText} error={analysis.error} />
      </div>

      {analysis.result && (
        <div className="mt-4">
          <ImportSummary result={analysis.result} />
        </div>
      )}

      <div className="mt-4 flex items-start gap-2.5 rounded-[12px] border bg-[var(--surface-muted)] p-3 text-[11px] leading-6 text-[var(--muted)]">
        <HardDrive size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
        اطلاعات مالی شما فقط روی همین دستگاه ذخیره می‌شود و به هیچ سروری ارسال نمی‌شود.
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 border-t pt-4">
        {!embedded && (
          <Dialog.Close asChild>
            <Button variant="outline">انصراف</Button>
          </Dialog.Close>
        )}
        <Button
          disabled={!importableCount}
          onClick={() => {
            if (!analysis.result) return;
            onImport(analysis.result.valid, analysis.result);
            if (!embedded) onOpenChange(false);
          }}
        >
          {validCount && commitmentCount
            ? `ورود ${toPersianNumber(validCount)} تراکنش و ${toPersianNumber(commitmentCount)} تعهد`
            : validCount
              ? `ورود ${toPersianNumber(validCount)} تراکنش`
              : commitmentCount
                ? `ورود ${toPersianNumber(commitmentCount)} تعهد`
                : "ورود اطلاعات"}
        </Button>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm" />
        <Dialog.Content
          dir="rtl"
          className="fixed left-1/2 top-1/2 z-50 max-h-[92dvh] w-[calc(100%-24px)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[18px] border bg-[var(--surface)] p-4 text-[var(--foreground)] shadow-[var(--shadow-2)] md:p-6"
        >
          {content}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
