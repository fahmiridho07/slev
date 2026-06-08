import { EntryType, SpendingMoment } from "../features/spendingMemory.types";
import { getRuntimeStrings } from "../i18n/runtime";
import { getMonthRange, isWithinRange } from "./analysis";

export const CATEGORY_DELTA_THRESHOLD = 0.05;

export type BreakdownMonthDelta = {
  currentAmount: number;
  deltaAmount: number;
  deltaPercent: number | null;
  previousAmount: number;
};

export type BreakdownIncreaseRow = {
  deltaAmount: number;
  deltaPercent: number | null;
  key: string;
  label: string;
};

export function filterBreakdownMoments(
  moments: SpendingMoment[],
  type: EntryType,
  rowKey: string,
  referenceDate: Date
): SpendingMoment[] {
  const range = getMonthRange(referenceDate, 0);

  return moments
    .filter((moment) => {
      if (moment.type !== type) {
        return false;
      }
      if (!isWithinRange(moment.occurredAt, range.start, range.end)) {
        return false;
      }
      if (type === "expense") {
        return moment.context === rowKey;
      }

      const source = moment.source || getRuntimeStrings().memory.momentTitle.income;
      return source === rowKey;
    })
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));
}

function getBreakdownRowKey(moment: SpendingMoment, type: EntryType): string {
  if (type === "expense") {
    return moment.context;
  }

  return moment.source || getRuntimeStrings().memory.momentTitle.income;
}

function sumBreakdownByKey(
  moments: SpendingMoment[],
  type: EntryType,
  range: { start: Date; end: Date }
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const moment of moments) {
    if (moment.type !== type || !isWithinRange(moment.occurredAt, range.start, range.end)) {
      continue;
    }

    const key = getBreakdownRowKey(moment, type);
    totals.set(key, (totals.get(key) ?? 0) + moment.amount);
  }

  return totals;
}

export function buildBreakdownMonthDeltas(
  moments: SpendingMoment[],
  type: EntryType,
  monthOffset: number,
  baseDate = new Date()
): Map<string, BreakdownMonthDelta> {
  const currentRange = getMonthRange(baseDate, monthOffset);
  const previousRange = getMonthRange(baseDate, monthOffset - 1);
  const currentTotals = sumBreakdownByKey(moments, type, currentRange);
  const previousTotals = sumBreakdownByKey(moments, type, previousRange);
  const keys = new Set([...currentTotals.keys(), ...previousTotals.keys()]);
  const deltas = new Map<string, BreakdownMonthDelta>();

  for (const key of keys) {
    const currentAmount = currentTotals.get(key) ?? 0;
    const previousAmount = previousTotals.get(key) ?? 0;
    deltas.set(key, {
      currentAmount,
      previousAmount,
      deltaAmount: currentAmount - previousAmount,
      deltaPercent: previousAmount > 0 ? (currentAmount - previousAmount) / previousAmount : null
    });
  }

  return deltas;
}

export function getTopBreakdownIncreases(
  rows: { amount: number; key: string; label: string }[],
  deltas: Map<string, BreakdownMonthDelta>,
  limit = 3
): BreakdownIncreaseRow[] {
  return rows
    .map((row) => {
      const delta = deltas.get(row.key);
      if (!delta || delta.deltaAmount <= 0 || delta.previousAmount <= 0) {
        return null;
      }

      return {
        key: row.key,
        label: row.label,
        deltaAmount: delta.deltaAmount,
        deltaPercent: delta.deltaPercent
      };
    })
    .filter((row): row is BreakdownIncreaseRow => row !== null)
    .sort((left, right) => right.deltaAmount - left.deltaAmount)
    .slice(0, limit);
}

export function shouldShowBreakdownDeltaBadge(delta: BreakdownMonthDelta | undefined): boolean {
  if (!delta || delta.currentAmount <= 0) {
    return false;
  }

  if (delta.previousAmount <= 0) {
    return true;
  }

  return delta.deltaPercent !== null && Math.abs(delta.deltaPercent) >= CATEGORY_DELTA_THRESHOLD;
}

export function getBreakdownDeltaBadgeKind(
  delta: BreakdownMonthDelta | undefined
): "down" | "new" | "up" | null {
  if (!shouldShowBreakdownDeltaBadge(delta) || !delta) {
    return null;
  }

  if (delta.previousAmount <= 0) {
    return "new";
  }

  if (delta.deltaAmount > 0) {
    return "up";
  }

  if (delta.deltaAmount < 0) {
    return "down";
  }

  return null;
}