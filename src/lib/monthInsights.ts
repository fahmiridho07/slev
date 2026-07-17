import { SpendingContext, SpendingMoment } from "../features/spendingMemory.types";
import { getMonthRange, isWithinRange } from "./dateRanges";

export type CategoryMonthDelta = {
  context: SpendingContext;
  current: number;
  previous: number;
  deltaAmount: number;
  /** null when the category is new this month (no previous spending). */
  deltaPercent: number | null;
};

/**
 * Compares per-category expense totals for the selected month against the month
 * before it, sorted by largest increase first.
 */
export function buildCategoryMonthDeltas(
  moments: SpendingMoment[],
  monthOffset: number,
  baseDate = new Date()
): CategoryMonthDelta[] {
  const current = sumByContext(moments, monthOffset, baseDate);
  const previous = sumByContext(moments, monthOffset - 1, baseDate);
  const contexts = new Set([...current.keys(), ...previous.keys()]);

  return [...contexts]
    .map((context) => {
      const currentAmount = current.get(context) ?? 0;
      const previousAmount = previous.get(context) ?? 0;
      return {
        context,
        current: currentAmount,
        previous: previousAmount,
        deltaAmount: currentAmount - previousAmount,
        deltaPercent: previousAmount > 0 ? (currentAmount - previousAmount) / previousAmount : null
      };
    })
    .sort((a, b) => b.deltaAmount - a.deltaAmount);
}

export function getTopCategoryIncreases(
  deltas: CategoryMonthDelta[],
  limit = 3
): CategoryMonthDelta[] {
  return deltas.filter((delta) => delta.deltaAmount > 0 && delta.current > 0).slice(0, limit);
}

export type MonthCashflowPoint = {
  monthDate: Date;
  income: number;
  expense: number;
  net: number;
};

/**
 * Income and expense totals for the trailing months ending at the month of
 * `baseDate` (oldest first). Months before the first logged entry are trimmed.
 */
export function buildCashflowTrend(
  moments: SpendingMoment[],
  monthCount = 6,
  baseDate = new Date()
): MonthCashflowPoint[] {
  const points: MonthCashflowPoint[] = [];

  for (let offset = -(monthCount - 1); offset <= 0; offset += 1) {
    const range = getMonthRange(baseDate, offset);
    let income = 0;
    let expense = 0;
    for (const moment of moments) {
      if (!isWithinRange(moment.occurredAt, range.start, range.end)) {
        continue;
      }
      if (moment.type === "income") {
        income += moment.amount;
      } else if (moment.type === "expense") {
        expense += moment.amount;
      }
    }
    points.push({ expense, income, monthDate: range.start, net: income - expense });
  }

  const firstActive = points.findIndex((point) => point.income > 0 || point.expense > 0);
  return firstActive <= 0 ? points : points.slice(firstActive);
}

/** Share of income kept this month (net / income); null when there is no income. */
export function getSavingsRate(income: number, expense: number): number | null {
  if (income <= 0) {
    return null;
  }
  return (income - expense) / income;
}

function sumByContext(
  moments: SpendingMoment[],
  monthOffset: number,
  baseDate: Date
): Map<SpendingContext, number> {
  const range = getMonthRange(baseDate, monthOffset);
  const totals = new Map<SpendingContext, number>();

  for (const moment of moments) {
    if (moment.type !== "expense" || !isWithinRange(moment.occurredAt, range.start, range.end)) {
      continue;
    }
    totals.set(moment.context, (totals.get(moment.context) ?? 0) + moment.amount);
  }

  return totals;
}
