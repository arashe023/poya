import { FileJson, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onImport, onSample }: { onImport: () => void; onSample: () => void }) {
  return (
    <div className="card app-shell relative overflow-hidden">
      <div className="relative flex min-h-[520px] flex-col items-center justify-center px-6 py-14 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[var(--accent-soft)] text-[var(--accent-strong)] ring-1 ring-inset ring-[var(--border-strong)]">
          <Sparkles size={26} strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">هنوز اطلاعات مالی وارد نشده است</h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--muted)]">
          برای دیدن وضعیت مالی، هزینه‌ها و بینش‌ها کافی است فایل JSON تراکنش‌های خود را وارد کنید. هیچ داده‌ای از دستگاه شما خارج نمی‌شود.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={onImport} size="default">
            <Upload size={16} />
            ورود فایل JSON
          </Button>
          <Button variant="outline" onClick={onSample}>
            <FileJson size={16} />
            نمایش اطلاعات نمونه
          </Button>
        </div>

        <div className="mt-10 grid w-full max-w-2xl gap-3 text-right sm:grid-cols-3">
          {[
            { title: "ورود آسان", body: "فایل JSON یا خروجی دفترکل را مستقیم وارد کنید." },
            { title: "ریال و تومان", body: "واحدها نرمال‌سازی و به ریال تبدیل می‌شوند." },
            { title: "کاملاً محلی", body: "ذخیره‌سازی فقط در همین مرورگر انجام می‌شود." },
          ].map((item) => (
            <div key={item.title} className="rounded-[13px] border bg-[var(--surface-muted)] p-3.5">
              <p className="text-xs font-bold">{item.title}</p>
              <p className="mt-1.5 text-[11px] leading-6 text-[var(--muted)]">{item.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 inline-flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <ShieldCheck size={14} className="text-[var(--accent)]" />
          بدون حساب کاربری، بدون سرور، بدون ردیابی
        </p>
      </div>
    </div>
  );
}
