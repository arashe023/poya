import type { CurrencyUnit } from "@/lib/types";
import { fromBaseRial } from "@/lib/currency";

const faNumber = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const faDecimal = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1, minimumFractionDigits: 0 });

export const toPersianNumber = (value: number | string) => String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
export const formatNumber = (value: number) => faNumber.format(Math.round(value));
export const currencyLabel = (unit: CurrencyUnit) => (unit === "IRR" ? "ریال" : "تومان");
export const formatMoney = (baseRialAmount: number, unit: CurrencyUnit) => `${formatNumber(fromBaseRial(baseRialAmount, unit))} ${currencyLabel(unit)}`;
export const formatPercent = (value: number) => `${faDecimal.format(Math.abs(value))}٪`;
export const formatCompactMoney = (baseRialAmount: number, unit: CurrencyUnit) => {
  const amount = fromBaseRial(baseRialAmount, unit);
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) return `${faDecimal.format(amount / 1_000_000_000)} میلیارد`;
  if (abs >= 1_000_000) return `${faDecimal.format(amount / 1_000_000)} م`;
  if (abs >= 1_000) return `${faDecimal.format(amount / 1_000)} ه`;
  return faDecimal.format(amount);
};
