import type { AccountInfo, TransactionType } from "@/lib/types";

export const TYPE_LABELS: Record<TransactionType, string> = {
  income: "درآمد",
  expenses: "هزینه",
  assets: "دارایی",
  liabilities: "بدهی",
  equity: "حقوق صاحبان سرمایه",
  other: "سایر",
};

const LABELS: Record<string, string> = {
  income: "درآمدها", expenses: "هزینه‌ها", assets: "دارایی‌ها", liabilities: "بدهی‌ها", equity: "حقوق صاحبان سرمایه",
  salary: "حقوق", freelance: "فریلنس", investment: "سرمایه‌گذاری", sales: "فروش",
  food: "خوراک", grocery: "مواد غذایی", restaurant: "رستوران", transportation: "حمل‌ونقل", shopping: "خرید",
  internet: "اینترنت", rent: "اجاره", utilities: "قبوض", health: "درمان", entertainment: "تفریح",
  bank: "بانک", cash: "نقد", loan: "وام", other: "سایر",
};

export const translateAccountSegment = (segment: string) => LABELS[segment.toLowerCase()] ?? segment;

export function parseAccount(value: string): AccountInfo {
  const raw = value.trim();
  const segments = raw.split(":").map((part) => part.trim()).filter(Boolean);
  const first = segments[0]?.toLowerCase();
  const type: TransactionType = first && ["income", "expenses", "assets", "liabilities", "equity"].includes(first)
    ? first as TransactionType : "other";
  const category = segments[1]?.toLowerCase() || "other";
  const subcategory = segments[2]?.toLowerCase();
  return {
    raw, segments, type, category, subcategory,
    typeLabel: TYPE_LABELS[type],
    categoryLabel: translateAccountSegment(category),
    subcategoryLabel: subcategory ? translateAccountSegment(subcategory) : undefined,
  };
}
