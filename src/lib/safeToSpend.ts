import { RecurringBill, SpendingMoment } from "../features/spendingMemory.types";
import { BalanceAnchor } from "../services/balanceAnchorRepository";
import { safeTime } from "./dateRanges";
import { getDaysRemainingInMonth } from "./financeEngine";
import { getMonthlyBillsTotal } from "./recurringBills";

export type SafeToSpendPace = "under" | "over" | "even" | "unknown";

export type SafeToSpendResult = {
  billsReserve: number;
  confident: boolean;
  daysLeft: number;
  effectiveBalance: number | null;
  pace: SafeToSpendPace;
  safeDaily: number | null;
  spendableBalance: number | null;
  typicalDaily: number;
};

export type SimulatePurchaseResult = {
  affordable: boolean;
  coversTypicalDays: boolean;
  newSafeDaily: number;
  remainingBalance: number;
};

/** Default expense context for payments already covered by the monthly bills reserve. */
export const RESERVED_BILL_CONTEXT = "Bills";

/**
 * Returns anchor amount plus net income and expenses logged strictly after the anchor
 * and on or before the reference moment. Expenses with context {@link RESERVED_BILL_CONTEXT}
 * are skipped — they are treated as already reserved via {@link buildSafeToSpend}'s
 * billsReserve, not deducted again here.
 */
export function getEffectiveBalance({
  balanceAnchor,
  moments,
  referenceDate = new Date()
}: {
  balanceAnchor: BalanceAnchor | null;
  moments: SpendingMoment[];
  referenceDate?: Date;
}): number | null {
  if (balanceAnchor === null) {
    return null;
  }

  const anchorTime = safeTime(balanceAnchor.setAt);
  const referenceTime = referenceDate.getTime();
  let netSince = 0;

  for (const moment of moments) {
    const momentTime = safeTime(moment.occurredAt);
    if (momentTime <= anchorTime || momentTime > referenceTime) {
      continue;
    }
    if (moment.type === "income") {
      netSince += moment.amount;
    } else if (moment.type === "expense" && moment.context !== RESERVED_BILL_CONTEXT) {
      netSince -= moment.amount;
    }
  }

  return balanceAnchor.amount + netSince;
}

export function getTypicalDailySpend(
  moments: SpendingMoment[],
  referenceDate: Date,
  windowDays = 30
): { amount: number; confident: boolean } {
  const windowEnd = startOfDay(referenceDate);
  const windowStart = new Date(windowEnd);
  windowStart.setDate(windowStart.getDate() - windowDays);
  const startTime = windowStart.getTime();
  const endTime = windowEnd.getTime();

  const expenseMoments = moments.filter(
    (moment) =>
      moment.type === "expense" &&
      safeTime(moment.occurredAt) >= startTime &&
      safeTime(moment.occurredAt) < endTime
  );
  if (expenseMoments.length === 0) {
    return { amount: 0, confident: false };
  }

  const distinctExpenseDays = new Set(
    expenseMoments.map((moment) => dayKey(safeTime(moment.occurredAt)))
  ).size;
  const firstExpenseTime = Math.min(...expenseMoments.map((moment) => safeTime(moment.occurredAt)));
  const firstExpenseDay = startOfDay(new Date(firstExpenseTime));
  const elapsedDays = clamp(
    daysBetween(firstExpenseDay, windowEnd),
    1,
    windowDays
  );
  const seriesStart = new Date(windowEnd);
  seriesStart.setDate(seriesStart.getDate() - elapsedDays);
  const dailyTotals = buildDailyTotals(seriesStart, elapsedDays, expenseMoments);
  const totalExpense = dailyTotals.reduce((sum, amount) => sum + amount, 0);
  const zeroDayCount = dailyTotals.filter((amount) => amount === 0).length;
  const amount =
    zeroDayCount > dailyTotals.length / 2
      ? Math.round(totalExpense / elapsedDays)
      : Math.round(median(dailyTotals));

  return {
    amount,
    confident: elapsedDays >= 14 && distinctExpenseDays >= 7
  };
}

/**
 * Safe-to-spend subtracts active recurring bills as a flat monthly reserve, then spreads
 * what remains across days left in the month. {@link getEffectiveBalance} skips
 * {@link RESERVED_BILL_CONTEXT} expenses so logging a bill payment does not double-count
 * against the reserve. Other expense contexts still reduce effective balance normally.
 * Re-anchoring after a bill has left the account can over-reserve until the next update.
 */
export function buildSafeToSpend({
  balanceAnchor,
  bills = [],
  moments,
  referenceDate = new Date(),
  windowDays = 30
}: {
  balanceAnchor: BalanceAnchor | null;
  bills?: RecurringBill[];
  moments: SpendingMoment[];
  referenceDate?: Date;
  windowDays?: number;
}): SafeToSpendResult {
  const effectiveBalance = getEffectiveBalance({
    balanceAnchor,
    moments,
    referenceDate
  });
  const billsReserve = getMonthlyBillsTotal(bills);
  const spendableBalance =
    effectiveBalance === null ? null : effectiveBalance - billsReserve;
  const daysLeft = getDaysRemainingInMonth(referenceDate);
  const { amount: typicalDaily, confident } = getTypicalDailySpend(moments, referenceDate, windowDays);
  const safeDaily =
    effectiveBalance === null
      ? null
      : Math.max(0, Math.round((spendableBalance ?? 0) / daysLeft));

  return {
    billsReserve,
    confident,
    daysLeft,
    effectiveBalance,
    pace: classifyPace(typicalDaily, safeDaily),
    safeDaily,
    spendableBalance,
    typicalDaily
  };
}

export function simulatePurchase({
  amount,
  safe
}: {
  amount: number;
  safe: SafeToSpendResult;
}): SimulatePurchaseResult {
  const baseBalance = safe.spendableBalance ?? 0;
  const remainingBalance = baseBalance - amount;
  const newSafeDaily = Math.max(0, Math.round(remainingBalance / safe.daysLeft));
  const typicalNeed = safe.typicalDaily * safe.daysLeft;
  const coversTypicalDays = remainingBalance >= typicalNeed;

  return {
    affordable: remainingBalance >= 0 && coversTypicalDays,
    coversTypicalDays,
    newSafeDaily,
    remainingBalance
  };
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(time: number): string {
  return startOfDay(new Date(time)).toISOString().slice(0, 10);
}

function daysBetween(startDay: Date, endDay: Date): number {
  const start = startOfDay(startDay).getTime();
  const end = startOfDay(endDay).getTime();
  return Math.max(0, Math.round((end - start) / (24 * 60 * 60 * 1000)));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildDailyTotals(seriesStart: Date, dayCount: number, expenseMoments: SpendingMoment[]): number[] {
  const totals: number[] = [];
  for (let offset = 0; offset < dayCount; offset += 1) {
    const dayStart = new Date(seriesStart);
    dayStart.setDate(dayStart.getDate() + offset);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dayStartTime = dayStart.getTime();
    const dayEndTime = dayEnd.getTime();
    const dayTotal = expenseMoments
      .filter(
        (moment) =>
          safeTime(moment.occurredAt) >= dayStartTime && safeTime(moment.occurredAt) < dayEndTime
      )
      .reduce((sum, moment) => sum + moment.amount, 0);
    totals.push(dayTotal);
  }
  return totals;
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function classifyPace(typicalDaily: number, safeDaily: number | null): SafeToSpendPace {
  if (safeDaily === null) {
    return "unknown";
  }
  if (typicalDaily < safeDaily) {
    return "under";
  }
  if (typicalDaily > safeDaily) {
    return "over";
  }
  return "even";
}