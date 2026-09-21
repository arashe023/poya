"use client";

import * as Popover from "@radix-ui/react-popover";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, getMonth, isAfter, isBefore, isSameDay, startOfMonth, subMonths } from "date-fns-jalali";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatJalaliLong, JALALI_MONTHS, WEEK_DAYS } from "@/lib/jalali-date";
import { toPersianNumber } from "@/lib/formatters";

export function JalaliRangePicker({ start, end, onChange }: { start?: Date; end?: Date; onChange: (start?: Date, end?: Date) => void }) {
  const [month, setMonth] = useState(start ?? new Date());
  const [draftStart, setDraftStart] = useState<Date | undefined>(start);
  const [draftEnd, setDraftEnd] = useState<Date | undefined>(end);
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const offset = (getDay(days[0]) + 1) % 7;

  const pick = (day: Date) => {
    if (!draftStart || draftEnd) { setDraftStart(day); setDraftEnd(undefined); return; }
    if (isBefore(day, draftStart)) { setDraftStart(day); setDraftEnd(draftStart); }
    else setDraftEnd(day);
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild><Button variant="outline" className="max-w-[240px] justify-start font-normal"><CalendarDays size={16} /><span className="truncate">{start ? `${formatJalaliLong(start)}${end ? ` تا ${formatJalaliLong(end)}` : ""}` : "انتخاب بازه شمسی"}</span></Button></Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={8} align="end" dir="rtl" className="z-50 w-[322px] rounded-[14px] border bg-[var(--surface)] p-4 text-[var(--foreground)] shadow-2xl shadow-black/15">
          <div className="mb-4 flex items-center justify-between">
            <button className="icon-button h-8 w-8" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight size={16} /></button>
            <strong className="text-sm">{JALALI_MONTHS[getMonth(month)]} {toPersianNumber(format(month, "yyyy"))}</strong>
            <button className="icon-button h-8 w-8" onClick={() => setMonth(subMonths(month, 1))}><ChevronLeft size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--muted)]">{WEEK_DAYS.map((day) => <span key={day}>{day.slice(0, 1)}</span>)}</div>
          <div className="mt-2 grid grid-cols-7 gap-1">{Array.from({ length: offset }).map((_, index) => <span key={`blank-${index}`} />)}{days.map((day) => {
            const selected = (draftStart && isSameDay(day, draftStart)) || (draftEnd && isSameDay(day, draftEnd));
            const inRange = draftStart && draftEnd && isAfter(day, draftStart) && isBefore(day, draftEnd);
            return <button key={day.toISOString()} onClick={() => pick(day)} className={`focus-ring h-9 rounded-lg text-xs ${selected ? "bg-[var(--accent)] font-bold text-white" : inRange ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "hover:bg-[var(--surface-muted)]"}`}>{toPersianNumber(format(day, "d"))}</button>;
          })}</div>
          <div className="mt-4 flex items-center justify-between border-t pt-3"><button className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]" onClick={() => { setDraftStart(undefined); setDraftEnd(undefined); onChange(undefined, undefined); }}>پاک کردن</button><Popover.Close asChild><Button size="sm" disabled={!draftStart} onClick={() => onChange(draftStart, draftEnd ?? draftStart)}>اعمال بازه</Button></Popover.Close></div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
