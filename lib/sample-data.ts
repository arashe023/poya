import type { RawTransaction } from "@/lib/types";
import { addDays, addMonths, parseISO } from "date-fns-jalali";

const expenseTemplates = [
  ["expenses:rent", "اجاره خانه", 15_800_000],
  ["expenses:food:grocery", "خرید مواد غذایی", 2_450_000],
  ["expenses:food:restaurant", "رستوران", 980_000],
  ["expenses:transportation", "رفت‌وآمد شهری", 720_000],
  ["expenses:internet", "اینترنت", 410_000],
  ["expenses:shopping", "خرید شخصی", 1_360_000],
  ["expenses:utilities", "قبض خدمات", 640_000],
] as const;

export function createSampleData(): RawTransaction[] {
  const data: RawTransaction[] = [];
  let index = 1;
  const firstJalaliMonth = parseISO("2025-03-21");
  for (let month = 0; month < 18; month++) {
    const monthStart = addMonths(firstJalaliMonth, month);
    const iso = (day: number) => {
      const date = addDays(monthStart, Math.min(day, 27) - 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };
    const growth = 1 + month * 0.018;
    data.push({ date: iso(2), amount: Math.round(39_700_000 * growth), txnidx: index++, description: "حقوق ماهانه", account: "income:salary", commodity: "IRT", status: "تسویه‌شده" });
    if (month % 2 === 0) data.push({ date: iso(11), amount: Math.round((4_200_000 + month * 170_000) * 10), txnidx: index++, description: "پروژه فریلنس", account: "income:freelance", commodity: "IRR", status: "تسویه‌شده" });
    expenseTemplates.forEach(([account, description, base], expenseIndex) => {
      const variability = 0.82 + ((month * 7 + expenseIndex * 11) % 31) / 100;
      const amount = Math.round(base * variability);
      const inRial = (month + expenseIndex) % 3 === 0;
      data.push({
        date: iso(4 + expenseIndex * 3), amount: -(inRial ? amount * 10 : amount), txnidx: index++,
        description, account, commodity: inRial ? "RIAL" : "TOMAN", status: expenseIndex === 5 ? "در انتظار" : "ثبت‌شده",
        comment: expenseIndex === 0 ? "پرداخت ماهانه" : "",
      });
    });
  }
  return data;
}

export const sampleJson = () => JSON.stringify(createSampleData(), null, 2);
