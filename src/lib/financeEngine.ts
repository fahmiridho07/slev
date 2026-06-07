import {
  AccountTier,
  BalanceSnapshot,
  CategoryMode,
  EntryType,
  MoneyAccount,
  MoneyTransfer,
  MonthlyPlan,
  SpendingContext,
  SpendingMoment
} from "../features/spendingMemory.types";
import { DEFAULT_SPENDING_CONTEXTS } from "../data/spendingMemory";
import { displayContext } from "../i18n/display";
import { getRuntimeStrings } from "../i18n/runtime";

export type FinanceCategoryModeValue = CategoryMode["mode"];

export type FinanceMonthSummary = {
  expense: number;
  fixedExpense: number;
  flexibleExpense: number;
  income: number;
  net: number;
  topCategories: {
    amount: number;
    label: string;
  }[];
};

export type FinanceBreakdownRow = {
  amount: number;
  key: string;
  label: string;
  share: number;
};

export type AllocationActionKind =
  | "set_plan"
  | "snapshot_balances"
  | "plan_exceeds_income"
  | "flexible_over_plan"
  | "top_up_pockets"
  | "hold";

export type AllocationRow = {
  actual: number;
  key: "income" | "fixed" | "flexible" | "savings";
  planned: number;
  progress: number;
  remaining: number;
};

export type AllocationPlan = {
  dailyFlexibleRoom: number;
  expectedIncome: number;
  fixedRemaining: number;
  flexibleRemaining: number;
  hubBalance: number;
  incomeGap: number;
  incomeReceived: number;
  nextAction: {
    amount?: number;
    kind: AllocationActionKind;
  };
  plannedGap: number;
  plannedTotal: number;
  pocketBalance: number;
  pocketCoverageDays: number;
  pocketTopUpNeed: number;
  possibleSavings: number;
  rows: AllocationRow[];
  savingsGap: number;
};

export type AccountReconciliationStatus =
  | "matched"
  | "small_gap"
  | "needs_review"
  | "needs_history"
  | "no_snapshot";

export type AccountReconciliationRow = {
  daysCovered: number;
  difference: number | null;
  expectedAmount: number | null;
  expense: number;
  income: number;
  label: string;
  latestAmount: number | null;
  latestSnapshotDate?: string;
  loggedDelta: number;
  previousAmount: number | null;
  previousSnapshotDate?: string;
  status: AccountReconciliationStatus;
  transferIn: number;
  transferOut: number;
};

const DEFAULT_RECONCILIATION_TOLERANCE = 1000;

export function buildCurrentMonthSummary(
  moments: SpendingMoment[],
  categoryModes: CategoryMode[],
  referenceDate = new Date()
): FinanceMonthSummary {
  const range = getMonthRange(referenceDate, 0);
  const monthMoments = moments.filter((moment) => isWithinRange(moment.occurredAt, range.start, range.end));
  const modeByCategory = getModeByCategory(categoryModes);
  const income = sumMoments(monthMoments.filter((moment) => moment.type === "income"));
  const expenses = monthMoments.filter((moment) => moment.type === "expense");
  const fixedExpense = sumMoments(expenses.filter((moment) => modeByCategory.get(moment.context) === "fixed"));
  const flexibleExpense = sumMoments(expenses.filter((moment) => modeByCategory.get(moment.context) !== "fixed"));
  const breakdown = buildMonthlyBreakdown(monthMoments, "expense", referenceDate);

  return {
    expense: fixedExpense + flexibleExpense,
    fixedExpense,
    flexibleExpense,
    income,
    net: income - fixedExpense - flexibleExpense,
    topCategories: breakdown.slice(0, 2).map((row) => ({ amount: row.amount, label: row.label }))
  };
}

export function getRunwayMonths({
  latestBalanceTotal,
  moments,
  referenceDate = new Date()
}: {
  latestBalanceTotal: number;
  moments: SpendingMoment[];
  referenceDate?: Date;
}): number | null {
  const monthlyExpenses: number[] = [];

  for (let monthOffset = -1; monthOffset >= -3; monthOffset -= 1) {
    const range = getMonthRange(referenceDate, monthOffset);
    const expense = sumMoments(
      moments.filter(
        (moment) => moment.type === "expense" && isWithinRange(moment.occurredAt, range.start, range.end)
      )
    );
    if (expense > 0) {
      monthlyExpenses.push(expense);
    }
  }

  if (monthlyExpenses.length === 0 || latestBalanceTotal <= 0) {
    return null;
  }

  const averageMonthlyExpense =
    monthlyExpenses.reduce((sum, expense) => sum + expense, 0) / monthlyExpenses.length;
  if (averageMonthlyExpense <= 0) {
    return null;
  }

  const runway = latestBalanceTotal / averageMonthlyExpense;
  if (!Number.isFinite(runway) || runway <= 0) {
    return null;
  }

  return Math.round(runway * 10) / 10;
}

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

export function getLatestBalanceTotal(snapshots: BalanceSnapshot[]): number {
  return getLatestBalanceSnapshots(snapshots).reduce((sum, snapshot) => sum + snapshot.amount, 0);
}

export type NetWorthPoint = {
  date: string;
  total: number;
};

export function buildNetWorthTrend({
  balanceSnapshots,
  maxPoints = 12,
  projectedSnapshots
}: {
  balanceSnapshots: BalanceSnapshot[];
  projectedSnapshots?: BalanceSnapshot[];
  maxPoints?: number;
}): NetWorthPoint[] {
  const sortedSnapshots = [...balanceSnapshots].sort(
    (left, right) => safeTime(left.snapshotDate) - safeTime(right.snapshotDate)
  );
  const distinctDates = [...new Set(sortedSnapshots.map((snapshot) => snapshot.snapshotDate))]
    .filter((date) => Number.isFinite(safeTime(date)))
    .sort((left, right) => safeTime(left) - safeTime(right));

  if (distinctDates.length === 0 && !projectedSnapshots?.length) {
    return [];
  }

  const points: NetWorthPoint[] = distinctDates.map((date) => {
    const asOfTime = safeTime(date);
    const latestByAccount = new Map<string, number>();

    sortedSnapshots.forEach((snapshot) => {
      if (safeTime(snapshot.snapshotDate) <= asOfTime) {
        latestByAccount.set(snapshot.accountLabel, snapshot.amount);
      }
    });

    const total = [...latestByAccount.values()].reduce((sum, amount) => sum + amount, 0);
    return { date, total };
  });

  if (projectedSnapshots?.length) {
    const todayDate = projectedSnapshots[0]?.snapshotDate ?? new Date().toISOString();
    const todayTotal = getLatestBalanceTotal(projectedSnapshots);
    const lastPoint = points[points.length - 1];

    if (!lastPoint || lastPoint.date !== todayDate) {
      points.push({ date: todayDate, total: todayTotal });
    } else {
      points[points.length - 1] = { date: todayDate, total: todayTotal };
    }
  }

  return points.slice(-maxPoints);
}

export function getProjectedBalanceSnapshots({
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
}): BalanceSnapshot[] {
  const latestSnapshots = getLatestBalanceSnapshots(balanceSnapshots);
  const latestByLabel = new Map(latestSnapshots.map((snapshot) => [snapshot.accountLabel, snapshot]));
  const accountIndex = new Map(accounts.map((account, index) => [account.label, index]));
  const labels = new Set<string>();
  const referenceTime = referenceDate.getTime();
  const projectedAt = referenceDate.toISOString();

  accounts.forEach((account) => labels.add(account.label));
  latestSnapshots.forEach((snapshot) => labels.add(snapshot.accountLabel));
  moments.forEach((moment) => {
    if (moment.accountLabel) labels.add(moment.accountLabel);
  });
  transfers.forEach((transfer) => {
    labels.add(transfer.fromAccount);
    labels.add(transfer.toAccount);
  });

  return Array.from(labels)
    .map((label) => {
      const latestSnapshot = latestByLabel.get(label);
      const baseTime = latestSnapshot ? safeTime(latestSnapshot.snapshotDate) : 0;
      const scopedMoments = moments.filter(
        (moment) =>
          moment.accountLabel === label &&
          isBetweenProjectionTimes(moment.occurredAt, baseTime, referenceTime)
      );
      const scopedTransfers = transfers.filter(
        (transfer) => isBetweenProjectionTimes(transfer.occurredAt, baseTime, referenceTime)
      );
      const income = scopedMoments
        .filter((moment) => moment.type === "income")
        .reduce((sum, moment) => sum + moment.amount, 0);
      const expense = scopedMoments
        .filter((moment) => moment.type === "expense")
        .reduce((sum, moment) => sum + moment.amount, 0);
      const transferIn = scopedTransfers
        .filter((transfer) => transfer.toAccount === label)
        .reduce((sum, transfer) => sum + transfer.amount, 0);
      const transferOut = scopedTransfers
        .filter((transfer) => transfer.fromAccount === label)
        .reduce((sum, transfer) => sum + transfer.amount, 0);

      return {
        accountLabel: label,
        amount: Math.round((latestSnapshot?.amount ?? 0) + income - expense + transferIn - transferOut),
        createdAt: latestSnapshot?.createdAt ?? projectedAt,
        id: `projected-${latestSnapshot?.id ?? label}`,
        snapshotDate: projectedAt
      };
    })
    .sort((a, b) => {
      const accountDiff =
        (accountIndex.get(a.accountLabel) ?? Number.MAX_SAFE_INTEGER) -
        (accountIndex.get(b.accountLabel) ?? Number.MAX_SAFE_INTEGER);
      return accountDiff !== 0 ? accountDiff : b.amount - a.amount;
    });
}

export function getLatestBalanceSnapshots(snapshots: BalanceSnapshot[]): BalanceSnapshot[] {
  const latestByLabel = new Map<string, BalanceSnapshot>();
  snapshots.forEach((snapshot) => {
    const current = latestByLabel.get(snapshot.accountLabel);
    if (!current || safeTime(snapshot.snapshotDate) > safeTime(current.snapshotDate)) {
      latestByLabel.set(snapshot.accountLabel, snapshot);
    }
  });
  return Array.from(latestByLabel.values()).sort(
    (a, b) => safeTime(b.snapshotDate) - safeTime(a.snapshotDate)
  );
}

export type TierBalanceSummary = {
  trackedTotal: number;
  ephemeralTotal: number;
  total: number;
  trackedAccountCount: number;
  ephemeralAccountCount: number;
};

export function summarizeBalanceByTier({
  accounts,
  snapshots
}: {
  accounts: MoneyAccount[];
  snapshots: BalanceSnapshot[];
}): TierBalanceSummary {
  const tierByLabel = new Map(
    accounts.map((account) => [account.label, account.tier ?? "tracked" as AccountTier])
  );
  const latestSnapshots = getLatestBalanceSnapshots(snapshots);

  let trackedTotal = 0;
  let ephemeralTotal = 0;
  let trackedAccountCount = 0;
  let ephemeralAccountCount = 0;

  for (const row of latestSnapshots) {
    const tier = tierByLabel.get(row.accountLabel) ?? "tracked";
    if (tier === "ephemeral") {
      ephemeralTotal += row.amount;
      ephemeralAccountCount += 1;
      continue;
    }

    trackedTotal += row.amount;
    trackedAccountCount += 1;
  }

  return {
    trackedTotal,
    ephemeralTotal,
    total: trackedTotal + ephemeralTotal,
    trackedAccountCount,
    ephemeralAccountCount
  };
}

export function buildAllocationPlan({
  accounts,
  latestSnapshots,
  hasBalanceEvidence,
  monthlyPlan,
  monthlySummary,
  today = new Date()
}: {
  hasBalanceEvidence?: boolean;
  accounts: MoneyAccount[];
  latestSnapshots: BalanceSnapshot[];
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: FinanceMonthSummary;
  today?: Date;
}): AllocationPlan {
  const expectedIncome = monthlyPlan?.expectedIncome ?? 0;
  const fixedBudget = monthlyPlan?.fixedCosts ?? 0;
  const flexibleBudget = monthlyPlan?.flexibleBudget ?? 0;
  const savingsTarget = monthlyPlan?.savingsTarget ?? 0;
  const plannedTotal = fixedBudget + flexibleBudget + savingsTarget;
  const plannedGap = expectedIncome - plannedTotal;
  const incomeGap = Math.max(0, expectedIncome - monthlySummary.income);
  const fixedRemaining = fixedBudget - monthlySummary.fixedExpense;
  const flexibleRemaining = flexibleBudget - monthlySummary.flexibleExpense;
  // Leftover cashflow (income - expense), not explicit savings transfers; true amount saved is deferred.
  const possibleSavings = Math.max(0, monthlySummary.net);
  const savingsGap = savingsTarget - possibleSavings;
  const daysRemaining = getDaysRemainingInMonth(today);
  const hasBalances = hasBalanceEvidence ?? latestSnapshots.length > 0;
  const dailyFlexibleRoom = monthlyPlan
    ? Math.max(0, Math.round(flexibleRemaining / daysRemaining))
    : 0;
  const snapshotByLabel = new Map(latestSnapshots.map((snapshot) => [snapshot.accountLabel, snapshot.amount]));
  const incomeHubLabel = accounts.find((account) => account.isIncomeHub)?.label;
  const hubBalance = incomeHubLabel ? snapshotByLabel.get(incomeHubLabel) ?? 0 : 0;
  const pocketBalance = latestSnapshots
    .filter((snapshot) => snapshot.accountLabel !== incomeHubLabel)
    .reduce((sum, snapshot) => sum + snapshot.amount, 0);
  const pocketTopUpNeed = monthlyPlan && hasBalances
    ? Math.max(0, flexibleRemaining - pocketBalance)
    : 0;
  const pocketCoverageDays = dailyFlexibleRoom > 0
    ? Math.floor(pocketBalance / dailyFlexibleRoom)
    : 0;

  return {
    dailyFlexibleRoom,
    expectedIncome,
    fixedRemaining,
    flexibleRemaining,
    hubBalance,
    incomeGap,
    incomeReceived: monthlySummary.income,
    nextAction: getAllocationAction({
      flexibleRemaining,
      hasPlan: Boolean(monthlyPlan),
      hasSnapshots: hasBalances,
      plannedGap,
      pocketTopUpNeed
    }),
    plannedGap,
    plannedTotal,
    pocketBalance,
    pocketCoverageDays,
    pocketTopUpNeed,
    possibleSavings,
    rows: [
      buildAllocationRow("income", expectedIncome, monthlySummary.income),
      buildAllocationRow("fixed", fixedBudget, monthlySummary.fixedExpense),
      buildAllocationRow("flexible", flexibleBudget, monthlySummary.flexibleExpense),
      buildAllocationRow("savings", savingsTarget, possibleSavings)
    ],
    savingsGap
  };
}

export function buildAccountReconciliation({
  accounts,
  balanceSnapshots,
  moments,
  toleranceAmount = DEFAULT_RECONCILIATION_TOLERANCE,
  transfers
}: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  moments: SpendingMoment[];
  toleranceAmount?: number;
  transfers: MoneyTransfer[];
}): AccountReconciliationRow[] {
  const labels = new Set<string>();
  accounts.forEach((account) => labels.add(account.label));
  balanceSnapshots.forEach((snapshot) => labels.add(snapshot.accountLabel));
  moments.forEach((moment) => {
    if (moment.accountLabel) labels.add(moment.accountLabel);
  });
  transfers.forEach((transfer) => {
    labels.add(transfer.fromAccount);
    labels.add(transfer.toAccount);
  });

  return Array.from(labels)
    .map((label) => buildAccountReconciliationRow({
      balanceSnapshots,
      label,
      moments,
      toleranceAmount,
      transfers
    }))
    .sort(sortReconciliationRows);
}

export type AccountDriftRow = {
  label: string;
  difference: number;
  latestSnapshotDate?: string;
};

export function buildAccountDriftAlerts(args: {
  accounts: MoneyAccount[];
  balanceSnapshots: BalanceSnapshot[];
  moments: SpendingMoment[];
  transfers: MoneyTransfer[];
  toleranceAmount?: number;
}): AccountDriftRow[] {
  const ephemeralLabels = new Set(
    args.accounts
      .filter((account) => account.tier === "ephemeral")
      .map((account) => account.label)
  );

  return buildAccountReconciliation(args)
    .filter(
      (row) =>
        row.status === "needs_review" &&
        row.difference !== null &&
        !ephemeralLabels.has(row.label)
    )
    .map((row) => ({
      label: row.label,
      difference: row.difference!,
      latestSnapshotDate: row.latestSnapshotDate
    }));
}

function buildAllocationRow(
  key: AllocationRow["key"],
  planned: number,
  actual: number
): AllocationRow {
  return {
    actual,
    key,
    planned,
    progress: planned > 0 ? actual / planned : 0,
    remaining: planned - actual
  };
}

function getAllocationAction({
  flexibleRemaining,
  hasPlan,
  hasSnapshots,
  plannedGap,
  pocketTopUpNeed
}: {
  flexibleRemaining: number;
  hasPlan: boolean;
  hasSnapshots: boolean;
  plannedGap: number;
  pocketTopUpNeed: number;
}): AllocationPlan["nextAction"] {
  if (!hasPlan) return { kind: "set_plan" };
  if (!hasSnapshots) return { kind: "snapshot_balances" };
  if (plannedGap < 0) return { amount: Math.abs(plannedGap), kind: "plan_exceeds_income" };
  if (flexibleRemaining < 0) return { amount: Math.abs(flexibleRemaining), kind: "flexible_over_plan" };
  if (pocketTopUpNeed > 0) return { amount: pocketTopUpNeed, kind: "top_up_pockets" };
  return { kind: "hold" };
}

function buildAccountReconciliationRow({
  balanceSnapshots,
  label,
  moments,
  toleranceAmount,
  transfers
}: {
  balanceSnapshots: BalanceSnapshot[];
  label: string;
  moments: SpendingMoment[];
  toleranceAmount: number;
  transfers: MoneyTransfer[];
}): AccountReconciliationRow {
  const snapshots = balanceSnapshots
    .filter((snapshot) => snapshot.accountLabel === label)
    .sort((a, b) => safeTime(a.snapshotDate) - safeTime(b.snapshotDate));
  const latest = snapshots[snapshots.length - 1];

  if (!latest) {
    return {
      daysCovered: 0,
      difference: null,
      expectedAmount: null,
      expense: 0,
      income: 0,
      label,
      latestAmount: null,
      loggedDelta: 0,
      previousAmount: null,
      status: "no_snapshot",
      transferIn: 0,
      transferOut: 0
    };
  }

  const previous = snapshots[snapshots.length - 2];
  if (!previous) {
    return {
      daysCovered: 0,
      difference: null,
      expectedAmount: null,
      expense: 0,
      income: 0,
      label,
      latestAmount: latest.amount,
      latestSnapshotDate: latest.snapshotDate,
      loggedDelta: 0,
      previousAmount: null,
      status: "needs_history",
      transferIn: 0,
      transferOut: 0
    };
  }

  const startTime = safeTime(previous.snapshotDate);
  const endTime = safeTime(latest.snapshotDate);
  const scopedMoments = moments.filter(
    (moment) =>
      moment.accountLabel === label &&
      isBetweenTimes(moment.occurredAt, startTime, endTime)
  );
  const scopedTransfers = transfers.filter(
    (transfer) => isBetweenTimes(transfer.occurredAt, startTime, endTime)
  );
  const income = scopedMoments
    .filter((moment) => moment.type === "income")
    .reduce((sum, moment) => sum + moment.amount, 0);
  const expense = scopedMoments
    .filter((moment) => moment.type === "expense")
    .reduce((sum, moment) => sum + moment.amount, 0);
  const transferIn = scopedTransfers
    .filter((transfer) => transfer.toAccount === label)
    .reduce((sum, transfer) => sum + transfer.amount, 0);
  const transferOut = scopedTransfers
    .filter((transfer) => transfer.fromAccount === label)
    .reduce((sum, transfer) => sum + transfer.amount, 0);
  const loggedDelta = income - expense + transferIn - transferOut;
  const expectedAmount = previous.amount + loggedDelta;
  const difference = latest.amount - expectedAmount;

  return {
    daysCovered: getDayDistance(startTime, endTime),
    difference,
    expectedAmount,
    expense,
    income,
    label,
    latestAmount: latest.amount,
    latestSnapshotDate: latest.snapshotDate,
    loggedDelta,
    previousAmount: previous.amount,
    previousSnapshotDate: previous.snapshotDate,
    status: getReconciliationStatus(difference, toleranceAmount),
    transferIn,
    transferOut
  };
}

function getReconciliationStatus(
  difference: number,
  toleranceAmount: number
): AccountReconciliationStatus {
  const absoluteDifference = Math.abs(difference);
  if (absoluteDifference <= toleranceAmount) return "matched";
  if (absoluteDifference <= toleranceAmount * 10) return "small_gap";
  return "needs_review";
}

function sortReconciliationRows(
  a: AccountReconciliationRow,
  b: AccountReconciliationRow
): number {
  const statusWeight: Record<AccountReconciliationStatus, number> = {
    needs_review: 0,
    small_gap: 1,
    matched: 2,
    needs_history: 3,
    no_snapshot: 4
  };
  const statusDifference = statusWeight[a.status] - statusWeight[b.status];
  if (statusDifference !== 0) return statusDifference;
  return Math.abs(b.difference ?? 0) - Math.abs(a.difference ?? 0);
}

function getDaysRemainingInMonth(date: Date): number {
  const dayOfMonth = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.max(1, daysInMonth - dayOfMonth + 1);
}

function getMonthRange(date: Date, monthOffset: number): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
  const end = new Date(date.getFullYear(), date.getMonth() + monthOffset + 1, 1);
  return { start, end };
}

function getDayDistance(startTime: number, endTime: number): number {
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    return 0;
  }
  return Math.max(1, Math.round((endTime - startTime) / (24 * 60 * 60 * 1000)));
}

function isBetweenTimes(value: string, startTime: number, endTime: number): boolean {
  const time = safeTime(value);
  return time > startTime && time <= endTime;
}

function isBetweenProjectionTimes(value: string, startTime: number, endTime: number): boolean {
  const time = safeTime(value);
  return time > startTime && time <= endTime;
}

function isWithinRange(value: string, start: Date, end: Date): boolean {
  const time = safeTime(value);
  return time >= start.getTime() && time < end.getTime();
}

function sumMoments(moments: SpendingMoment[]): number {
  return moments.reduce((sum, moment) => sum + moment.amount, 0);
}

function safeTime(value: string): number {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}
