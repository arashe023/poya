import type { CurrencyUnit } from "@/lib/types";

const IRR_ALIASES = new Set(["IRR", "RIAL", "ریال"]);
const IRT_ALIASES = new Set(["IRT", "TOMAN", "تومان"]);

export function normalizeCurrency(value: unknown): CurrencyUnit | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (IRR_ALIASES.has(normalized)) return "IRR";
  if (IRT_ALIASES.has(normalized)) return "IRT";
  return null;
}

export const convertRialToToman = (amount: number) => amount / 10;
export const convertTomanToRial = (amount: number) => amount * 10;

export function convertCurrency(amount: number, from: CurrencyUnit, to: CurrencyUnit) {
  if (from === to) return amount;
  return from === "IRR" ? convertRialToToman(amount) : convertTomanToRial(amount);
}

export function toBaseRial(amount: number, unit: CurrencyUnit) {
  return unit === "IRR" ? amount : convertTomanToRial(amount);
}

export function fromBaseRial(amount: number, unit: CurrencyUnit) {
  return unit === "IRR" ? amount : convertRialToToman(amount);
}
