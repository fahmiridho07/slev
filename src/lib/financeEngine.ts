import {
  CategoryMode,
  EntryType,
  SpendingContext,
  SpendingMoment
} from "../features/spendingMemory.types";
import { DEFAULT_SPENDING_CONTEXTS } from "../data/spendingMemory";
import { displayContext } from "../i18n/display";
import { getRuntimeStrings } from "../i18n/runtime";
import { getMonthRange, isWithinRange, sumMoments } from "./dateRanges";

export type FinanceCategoryModeValue = CategoryMode["mode"];

export type FinanceBreakdownRow = {
  amount: number;
  key: string;
  label: string;
  share: number;
};

export function buildMonthlyBreakdown(
  moments: SpendingMoment[],
  type: EntryType,
  referenceDate = new Date()
): FinanceBreakdownRow[] {
  const currentMonth = getMonthRange(referenceDate, 0);
  const filtered = moments.filter(
    (moment) => moment.type === type && isWithinRange(moment.occurredAt, currentMonth.start, currentMonth.end)
  );
  const total = sumMoments(filtered);
  const grouped = filtered.reduce<Record<string, number>>((acc, moment) => {
    const label =
      type === "income"
        ? moment.source || getRuntimeStrings().memory.momentTitle.income
        : moment.context;
    acc[label] = (acc[label] ?? 0) + moment.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([label, amount]) => ({
      amount,
      key: label,
      label: type === "expense" ? displayContext(label) : label,
      share: total > 0 ? amount / total : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getModeByCategory(categoryModes: CategoryMode[]): Map<SpendingContext, FinanceCategoryModeValue> {
  const modes = new Map<SpendingContext, FinanceCategoryModeValue>(
    DEFAULT_SPENDING_CONTEXTS.map((category) => [category, category === "Bills" || category === "Home" ? "fixed" : "flexible"])
  );
  categoryModes.forEach((item) => {
    modes.set(item.category, item.mode);
  });
  return modes;
}

export function getDaysRemainingInMonth(date: Date): number {
  const dayOfMonth = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.max(1, daysInMonth - dayOfMonth + 1);
}