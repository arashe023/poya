import { DatabaseZap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onImport, onSample }: { onImport: () => void; onSample: () => void }) {
  return (
    <div className="card flex min-h-[480px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] bg-[var(--accent-soft)] text-[var(--accent)]"><DatabaseZap size={25} strokeWidth={1.8} /></div>
      <h2 className="text-xl font-bold">هنوز اطلاعات مالی وارد نشده است</h2>
      <p className="mt-2 max-w-md text-sm leading-7 text-[var(--muted)]">برای مشاهده وضعیت مالی، فایل JSON تراکنش‌های خود را وارد کنید. هیچ داده‌ای از دستگاه شما خارج نمی‌شود.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Button onClick={onImport}>ورود JSON</Button><Button variant="outline" onClick={onSample}>نمایش اطلاعات نمونه</Button></div>
    </div>
  );
}
