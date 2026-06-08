import {
  BalanceSnapshot,
  MoneyAccount,
  MoneyTransfer,
  SpendingMoment
} from "../features/spendingMemory.types";
import { safeTime } from "./dateRanges";
import {
  getDaysRemainingInMonth,
  getLatestBalanceTotal,
  getProjectedBalanceSnapshots
} from "./financeEngine";

export type SafeToSpendPace = "under" | "over" | "even" | "unknown";

export type SafeToSpendResult = {
  confident: boolean;
  daysLeft: number;
  effectiveBalance: number | null;
  pace: SafeToSpendPace;
  safeDaily: number | null;
  typicalDaily: number;
};

export type SimulatePurchaseResult = {
  affordable: boolean;
  coversTypicalDays: boolean;
  newSafeDaily: number;
  remainingBalance: number;
};

export function getEffectiveBalance({
  accounts,
  balanceSnapshots,
  moments,
  referenceDate = new Date(),
  transfers
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  moments: SpendingMoment[];
  referenceDate?: Date;
  transfers: MoneyTransfer[];
}): number | null {
  if (balanceSnapshots.length === 0) {
    return null;
  }

  return getLatestBalanceTotal(
    getProjectedBalanceSnapshots({
      accounts,
      balanceSnapshots,
      moments,
      referenceDate,
      transfers
    })
  );
}

export function getDaysUntilNextIncome(referenceDate: Date, paydayDayOfMonth?: number): number {
  if (paydayDayOfMonth === undefined) {
    return getDaysRemainingInMonth(referenceDate);
  }

  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const day = referenceDate.getDate();
  const clampedPayday = (targetYear: number, targetMonth: number) => {
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    return Math.min(paydayDayOfMonth, daysInMonth);
  };

  const thisMonthPayday = clampedPayday(year, month);
  if (thisMonthPayday > day) {
    return Math.max(1, thisMonthPayday - day);
  }
  if (thisMonthPayday === day) {
    return 1;
  }

  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const nextMonth = month + 1;
  const nextYear = nextMonth > 11 ? year + 1 : year;
  const nextMonthIndex = nextMonth % 12;
  const nextMonthPayday = clampedPayday(nextYear, nextMonthIndex);

  return Math.max(1, daysInCurrentMonth - day + nextMonthPayday);
}

export function getTypicalDailySpend(
  moments: SpendingMoment[],
  referenceDate: Date,
  windowDays = 30
): { amount: number; confident: boolean } {
  const windowEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
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
  const expenseDays = new Set(
    expenseMoments.map((moment) => new Date(safeTime(moment.occurredAt)).toISOString().slice(0, 10))
  );
  const totalExpense = expenseMoments.reduce((sum, moment) => sum + moment.amount, 0);

  return {
    amount: Math.round(totalExpense / windowDays),
    confident: expenseDays.size >= 14
  };
}

export function buildSafeToSpend({
  accounts,
  balanceSnapshots,
  moments,
  paydayDayOfMonth,
  referenceDate = new Date(),
  transfers,
  windowDays = 30
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  moments: SpendingMoment[];
  paydayDayOfMonth?: number;
  referenceDate?: Date;
  transfers: MoneyTransfer[];
  windowDays?: number;
}): SafeToSpendResult {
  const effectiveBalance = getEffectiveBalance({
    accounts,
    balanceSnapshots,
    moments,
    referenceDate,
    transfers
  });
  const daysLeft = getDaysUntilNextIncome(referenceDate, paydayDayOfMonth);
  const { amount: typicalDaily, confident } = getTypicalDailySpend(moments, referenceDate, windowDays);
  const safeDaily =
    effectiveBalance === null
      ? null
      : Math.max(0, Math.round(effectiveBalance / daysLeft));

  return {
    confident,
    daysLeft,
    effectiveBalance,
    pace: classifyPace(typicalDaily, safeDaily),
    safeDaily,
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
  const baseBalance = safe.effectiveBalance ?? 0;
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