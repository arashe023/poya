"use client";

import * as Popover from "@radix-ui/react-popover";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, getMonth, isAfter, isBefore, isSameDay, startOfMonth, subMonths } from "date-fns-jalali";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatJalaliLong, JALALI_MONTHS, WEEK_DAYS } from "@/lib/jalali-date";
import { toPersianNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function JalaliRangePicker({ start, end, onChange }: { start?: Date; end?: Date; onChange: (start?: Date, end?: Date) => void }) {
  const [month, setMonth] = useState(start ?? new Date());
  const [draftStart, setDraftStart] = useState<Date | undefined>(start);
  const [draftEnd, setDraftEnd] = useState<Date | undefined>(end);
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const offset = (getDay(days[0]) + 1) % 7;

  const pick = (day: Date) => {
    if (!draftStart || draftEnd) {
      setDraftStart(day);
      setDraftEnd(undefined);
      return;
    }
    if (isBefore(day, draftStart)) {
      setDraftStart(day);
      setDraftEnd(draftStart);
    } else setDraftEnd(day);
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="control focus-ring flex max-w-[250px] shrink-0 items-center justify-start gap-2 text-right">
          <CalendarDays size={15} className="shrink-0 text-[var(--muted)]" />
          <span className="truncate">{start ? `${formatJalaliLong(start)}${end ? ` تا ${formatJalaliLong(end)}` : ""}` : "انتخاب بازه شمسی"}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={8} align="end" dir="rtl" className="z-50 w-[326px] rounded-[16px] border bg-[var(--surface)] p-4 text-[var(--foreground)] shadow-[var(--shadow-2)]">
          <div className="mb-4 flex items-center justify-between">
            <button aria-label="ماه بعد" className="icon-button h-8 w-8" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight size={16} />
            </button>
            <strong className="text-sm">
              {JALALI_MONTHS[getMonth(month)]} {toPersianNumber(format(month, "yyyy"))}
            </strong>
            <button aria-label="ماه قبل" className="icon-button h-8 w-8" onClick={() => setMonth(subMonths(month, 1))}>
              <ChevronLeft size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[var(--muted)]">
            {WEEK_DAYS.map((day) => (
              <span key={day}>{day.slice(0, 1)}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {Array.from({ length: offset }).map((_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {days.map((day) => {
              const selected = (draftStart && isSameDay(day, draftStart)) || (draftEnd && isSameDay(day, draftEnd));
              const inRange = draftStart && draftEnd && isAfter(day, draftStart) && isBefore(day, draftEnd);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => pick(day)}
                  className={cn(
                    "focus-ring numbers h-9 rounded-[9px] text-xs transition",
                    selected
                      ? "bg-[var(--accent)] font-bold text-[var(--accent-contrast)]"
                      : inRange
                        ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                        : "hover:bg-[var(--surface-muted)]",
                  )}
                >
                  {toPersianNumber(format(day, "d"))}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <button
              className="text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
              onClick={() => {
                setDraftStart(undefined);
                setDraftEnd(undefined);
                onChange(undefined, undefined);
              }}
            >
              پاک کردن
            </button>
            <Popover.Close asChild>
              <Button size="sm" disabled={!draftStart} onClick={() => onChange(draftStart, draftEnd ?? draftStart)}>
                اعمال بازه
              </Button>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
