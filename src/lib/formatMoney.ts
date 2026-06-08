import { SpendingMoment } from "../features/spendingMemory.types";
import { formatRupiah } from "./spendingMemoryPatterns";

export function parseAmountInput(value: string): number | null {
  const amount = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function formatAmountInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatSignedCompactRupiah(amount: number): string {
  if (amount > 0) return `+${formatRupiah(amount)}`;
  if (amount < 0) return `-${formatRupiah(Math.abs(amount))}`;
  return formatRupiah(0);
}

export function formatShortRupiah(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const rounded = millions >= 10 ? Math.round(millions) : Math.round(millions * 10) / 10;
    return `${rounded} jt`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)} rb`;
  }
  return formatRupiah(amount);
}

export function formatMomentAmount(moment: SpendingMoment): string {
  return moment.type === "income"
    ? `+${formatRupiah(moment.amount)}`
    : formatRupiah(moment.amount);
}