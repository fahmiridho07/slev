import { SpendingMoment } from "../features/spendingMemory.types";
import { getMonthRange, isWithinRange, sumExpenseMoments } from "./analysis";

export function getMonthReferenceDate(monthOffset: number, baseDate = new Date()): Date {
  return getMonthRange(baseDate, monthOffset).start;
}

export function getEarliestSpendingMonthOffset(moments: SpendingMoment[], baseDate = new Date()): number {
  if (moments.length === 0) {
    return 0;
  }

  let earliestTime = Date.parse(moments[0].occurredAt);
  for (const moment of moments) {
    const time = Date.parse(moment.occurredAt);
    if (time < earliestTime) {
      earliestTime = time;
    }
  }

  const earliest = new Date(earliestTime);
  const monthDiff =
    (baseDate.getFullYear() - earliest.getFullYear()) * 12 + (baseDate.getMonth() - earliest.getMonth());
  return -monthDiff;
}

export function isCurrentMonthOffset(monthOffset: number): boolean {
  return monthOffset === 0;
}

export function isCurrentMonthDate(referenceDate: Date, baseDate = new Date()): boolean {
  return (
    referenceDate.getFullYear() === baseDate.getFullYear() && referenceDate.getMonth() === baseDate.getMonth()
  );
}

export type MonthExpenseComparison = {
  currentExpense: number;
  deltaAmount: number;
  deltaPercent: number | null;
  previousExpense: number;
};

export function buildMonthExpenseComparison(
  moments: SpendingMoment[],
  monthOffset: number,
  baseDate = new Date()
): MonthExpenseComparison {
  const currentRange = getMonthRange(baseDate, monthOffset);
  const previousRange = getMonthRange(baseDate, monthOffset - 1);
  const currentExpense = sumExpenseMoments(
    moments.filter(
      (moment) => moment.type === "expense" && isWithinRange(moment.occurredAt, currentRange.start, currentRange.end)
    )
  );
  const previousExpense = sumExpenseMoments(
    moments.filter(
      (moment) => moment.type === "expense" && isWithinRange(moment.occurredAt, previousRange.start, previousRange.end)
    )
  );

  return {
    currentExpense,
    previousExpense,
    deltaAmount: currentExpense - previousExpense,
    deltaPercent: previousExpense > 0 ? (currentExpense - previousExpense) / previousExpense : null
  };
}