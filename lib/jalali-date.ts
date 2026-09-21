import { endOfMonth, endOfYear, format, getDate, getMonth, getYear, parseISO, startOfMonth, startOfYear, subMonths, subYears } from "date-fns-jalali";
import type { DatePreset, JalaliDateInfo } from "@/lib/types";

export const JALALI_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
export const WEEK_DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
const faDigits = (value: string | number) => String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export function toJalali(originalDate: string): JalaliDateInfo {
  const date = parseISO(originalDate);
  if (Number.isNaN(date.getTime())) throw new Error("تاریخ نامعتبر است");
  const jalaliYear = getYear(date);
  const jalaliMonth = getMonth(date) + 1;
  const jalaliDay = getDate(date);
  return {
    originalDate, date, jalaliYear, jalaliMonth, jalaliDay,
    jalaliDate: format(date, "yyyy/MM/dd"),
    monthKey: `${jalaliYear}-${String(jalaliMonth).padStart(2, "0")}`,
  };
}

export const formatJalaliLong = (date: Date) => `${faDigits(getDate(date))} ${JALALI_MONTHS[getMonth(date)]} ${faDigits(getYear(date))}`;
export const formatJalaliMonth = (year: number, month: number) => `${JALALI_MONTHS[month - 1]} ${faDigits(year)}`;
export const monthKey = (date: Date) => `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, "0")}`;

export function getDateRange(preset: DatePreset, now = new Date(), custom?: { start?: string; end?: string }) {
  if (preset === "all") return {};
  if (preset === "custom") {
    return {
      start: custom?.start ? parseISO(custom.start) : undefined,
      end: custom?.end ? parseISO(custom.end) : undefined,
    };
  }
  const thisMonthStart = startOfMonth(now);
  if (preset === "thisMonth") return { start: thisMonthStart, end: endOfMonth(now) };
  if (preset === "lastMonth") {
    const last = subMonths(now, 1);
    return { start: startOfMonth(last), end: endOfMonth(last) };
  }
  if (preset === "threeMonths") return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
  if (preset === "sixMonths") return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
  if (preset === "thisYear") return { start: startOfYear(now), end: now };
  const previousYear = subYears(now, 1);
  return { start: startOfYear(previousYear), end: endOfYear(previousYear) };
}
