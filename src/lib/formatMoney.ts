import { SpendingMoment } from "../features/spendingMemory.types";
import { formatCompactRupiah } from "./spendingMemoryPatterns";

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
  if (amount > 0) return `+${formatCompactRupiah(amount)}`;
  if (amount < 0) return `-${formatCompactRupiah(Math.abs(amount))}`;
  return formatCompactRupiah(0);
}

export function formatMomentAmount(moment: SpendingMoment): string {
  return moment.type === "income"
    ? `+${formatCompactRupiah(moment.amount)}`
    : formatCompactRupiah(moment.amount);
}