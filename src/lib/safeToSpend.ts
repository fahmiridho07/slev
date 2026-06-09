import { MoneyAccount, MoneyTransfer, RecurringBill, SpendingMoment } from "../features/spendingMemory.types";
import { getTrackedTotalBalance } from "./accountLedger";
import { safeTime } from "./dateRanges";
import { getDaysRemainingInMonth, getDaysUntilNextPayday } from "./financeEngine";
import { getBillsReserve } from "./recurringBills";

export type SafeToSpendPace = "under" | "over" | "even" | "unknown";

export type SafeToSpendResult = {
  billsReserve: number;
  confident: boolean;
  daysLeft: number;
  effectiveBalance: number;
  pace: SafeToSpendPace;
  safeDaily: number;
  spendableBalance: number;
  spendBuffer: number;
  typicalDaily: number;
};

export type PurchaseVerdict = "affordable" | "over_pace" | "dips_reserve" | "unaffordable";

export type PurchaseInsight =
  | "affordable"
  | "below_daily_need"
  | "comfortable"
  | "dips_reserve"
  | "tight_multi_day"
  | "tight_one_day"
  | "unaffordable";

export type SimulatePurchaseResult = {
  affordable: boolean;
  coversTypicalDays: boolean;
  daysAtTypicalPace: number;
  insight: PurchaseInsight;
  newSafeDaily: number;
  remainingBalance: number;
  shortfall: number;
  verdict: PurchaseVerdict;
};

/** Default expense context for payments already covered by the monthly bills reserve. */
export const RESERVED_BILL_CONTEXT = "Bills";

/**
 * Returns the tracked-account total as of the reference moment. Bills-context expenses
 * are excluded so they are not double-counted against {@link buildSafeToSpend}'s
 * billsReserve; other expenses still reduce balance normally.
 */
export function getEffectiveBalance({
  accounts,
  moments,
  transfers,
  referenceDate = new Date()
}: {
  accounts: MoneyAccount[];
  moments: SpendingMoment[];
  transfers: MoneyTransfer[];
  referenceDate?: Date;
}): number {
  const referenceTime = referenceDate.getTime();
  const spendableMoments = moments.filter((moment) => {
    const momentTime = safeTime(moment.occurredAt);
    if (momentTime > referenceTime) {
      return false;
    }
    if (moment.type === "expense" && moment.context === RESERVED_BILL_CONTEXT) {
      return false;
    }
    return true;
  });
  const spendableTransfers = transfers.filter(
    (transfer) => safeTime(transfer.occurredAt) <= referenceTime
  );

  return getTrackedTotalBalance(accounts, spendableMoments, spendableTransfers);
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
      moment.context !== RESERVED_BILL_CONTEXT &&
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
 * Safe-to-spend subtracts upcoming recurring bills (those due within the current horizon —
 * today through the next payday, or month-end when no payday is set) as a reserve, then
 * spreads what remains across the days left in that horizon. Bills with no due day are
 * reserved in full, matching the previous flat-monthly behavior. {@link getEffectiveBalance}
 * still skips {@link RESERVED_BILL_CONTEXT} expenses so logging a bill payment does not
 * double-count against the reserve; other expense contexts reduce effective balance normally.
 */
export function buildSafeToSpend({
  accounts,
  bills = [],
  moments,
  transfers,
  referenceDate = new Date(),
  windowDays = 30,
  paydayDayOfMonth,
  spendBuffer = 0
}: {
  accounts: MoneyAccount[];
  bills?: RecurringBill[];
  moments: SpendingMoment[];
  transfers: MoneyTransfer[];
  referenceDate?: Date;
  windowDays?: number;
  paydayDayOfMonth?: number;
  spendBuffer?: number;
}): SafeToSpendResult {
  const effectiveBalance = getEffectiveBalance({ accounts, moments, transfers, referenceDate });
  const billsReserve = getBillsReserve(bills, referenceDate, paydayDayOfMonth);
  const availableAfterBills = effectiveBalance - billsReserve;
  const appliedBuffer = availableAfterBills > 0 ? Math.min(Math.max(0, spendBuffer), availableAfterBills) : 0;
  const spendableBalance = availableAfterBills - appliedBuffer;
  const daysLeft =
    paydayDayOfMonth != null
      ? getDaysUntilNextPayday(referenceDate, paydayDayOfMonth)
      : getDaysRemainingInMonth(referenceDate);
  const { amount: typicalDaily, confident } = getTypicalDailySpend(moments, referenceDate, windowDays);
  const safeDaily = Math.max(0, Math.round(spendableBalance / daysLeft));

  return {
    billsReserve,
    confident,
    daysLeft,
    effectiveBalance,
    pace: classifyPace(typicalDaily, safeDaily),
    safeDaily,
    spendableBalance,
    spendBuffer: appliedBuffer,
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
  const remainingBalance = safe.spendableBalance - amount;
  const remainingActual = safe.effectiveBalance - amount;
  const newSafeDaily = Math.max(0, Math.round(remainingBalance / safe.daysLeft));
  const typicalNeed = safe.typicalDaily * safe.daysLeft;
  const coversTypicalDays = remainingBalance >= typicalNeed;
  const verdict: PurchaseVerdict =
    remainingActual < 0
      ? "unaffordable"
      : remainingBalance < 0
        ? "dips_reserve"
        : coversTypicalDays
          ? "affordable"
          : "over_pace";
  const shortfall =
    verdict === "unaffordable"
      ? -remainingActual
      : verdict === "dips_reserve"
        ? -remainingBalance
        : verdict === "over_pace"
          ? Math.max(0, typicalNeed - remainingBalance)
          : 0;
  const daysAtTypicalPace =
    safe.typicalDaily > 0 ? Math.floor(remainingBalance / safe.typicalDaily) : safe.daysLeft;
  const insight = classifyPurchaseInsight({
    daysAtTypicalPace,
    newSafeDaily,
    remainingBalance,
    safe,
    verdict
  });

  return {
    affordable: verdict === "affordable",
    coversTypicalDays,
    daysAtTypicalPace,
    insight,
    newSafeDaily,
    remainingBalance,
    shortfall,
    verdict
  };
}

function classifyPurchaseInsight({
  daysAtTypicalPace,
  newSafeDaily,
  remainingBalance,
  safe,
  verdict
}: {
  daysAtTypicalPace: number;
  newSafeDaily: number;
  remainingBalance: number;
  safe: SafeToSpendResult;
  verdict: PurchaseVerdict;
}): PurchaseInsight {
  if (verdict === "unaffordable") {
    return "unaffordable";
  }
  if (verdict === "dips_reserve") {
    return "dips_reserve";
  }
  if (verdict === "affordable") {
    if (safe.typicalDaily > 0 && newSafeDaily >= Math.round(safe.typicalDaily * 1.1)) {
      return "comfortable";
    }
    return "affordable";
  }

  if (safe.typicalDaily > 0 && remainingBalance < safe.typicalDaily) {
    return "below_daily_need";
  }
  if (daysAtTypicalPace <= 1) {
    return "tight_one_day";
  }
  return "tight_multi_day";
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