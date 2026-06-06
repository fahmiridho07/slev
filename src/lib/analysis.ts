import {
  BudgetPeriod,
  EntryType,
  ExpenseCategory,
  ManualTemplate,
  MoneyAccount,
  SpendingContext,
  SpendingMoment,
  SpendingPattern
} from "../features/spendingMemory.types";
import {
  AccountReconciliationRow,
  AllocationPlan,
  buildMonthlyBreakdown
} from "./financeEngine";
import { formatSignedCompactRupiah } from "./formatMoney";
import { formatCompactRupiah } from "./spendingMemoryPatterns";

export type CashflowWeek = {
  expense: number;
  income: number;
  key: string;
  label: string;
  net: number;
};

export type SpendingTrend = {
  midpointMessage?: string;
  months: {
    amount: number;
    key: string;
    label: string;
    share: number;
  }[];
  topCategories: {
    amount: number;
    label: string;
  }[];
};

export type AccountActivityRow = {
  expense: number;
  income: number;
  label: string;
  net: number;
  share: number;
};

export type RepeatSuggestion = {
  accountLabel?: string;
  amount: number;
  context: SpendingContext;
  label: string;
};

export function getMomentTitle(moment: SpendingMoment): string {
  if (moment.type === "income") return moment.source || moment.label || "Income";
  return moment.label || moment.context;
}

export function getTemplateLabel(template: ManualTemplate): string {
  if (template.type === "income") return template.source || "Income";
  return template.label || template.context;
}

export function getCategoryDeleteBody(category: ExpenseCategory): string {
  return category.isDefault
    ? `${category.label} will disappear from capture and budget limits. Existing memories stay saved.`
    : `${category.label} will be removed from capture and budget limits. Existing memories stay saved.`;
}

export function getAllocationActionCopy(allocation: AllocationPlan): {
  detail: string;
  title: string;
  tone: SpendingPattern["tone"];
} {
  const amount = allocation.nextAction.amount ?? 0;

  switch (allocation.nextAction.kind) {
    case "set_plan":
      return {
        detail: "Add expected income, fixed costs, flexible spending, and savings target for this month.",
        title: "Set the monthly envelope",
        tone: "calm"
      };
    case "snapshot_balances":
      return {
        detail: "Add quick snapshots for BRI, Jago, wallets, and cash so pocket funding can be checked.",
        title: "Snapshot balances first",
        tone: "calm"
      };
    case "plan_exceeds_income":
      return {
        detail: `The plan is ${formatCompactRupiah(amount)} above expected income. Lower one allocation or raise the expected income only if it is realistic.`,
        title: "Plan is above income",
        tone: "notice"
      };
    case "flexible_over_plan":
      return {
        detail: `Flexible spending is ${formatCompactRupiah(amount)} over the monthly envelope. Treat the rest of the month as a slower-spend period.`,
        title: "Flexible budget is already crossed",
        tone: "notice"
      };
    case "top_up_pockets":
      return {
        detail: `Moving up to ${formatCompactRupiah(amount)} from the income hub would fully fund the remaining flexible budget. Hub snapshot shows ${formatCompactRupiah(allocation.hubBalance)}.`,
        title: "Pocket top-up is visible",
        tone: "warm"
      };
    case "hold":
      return {
        detail: "The current pocket balance covers remaining flexible spending. Keep logging normally and update snapshots when balances change.",
        title: "Allocation is steady",
        tone: "calm"
      };
  }
}

export function getAllocationRowCopy(row: AllocationPlan["rows"][number]): {
  detail: string;
  title: string;
} {
  const remainingAmount = Math.abs(row.remaining);

  if (row.key === "income") {
    if (row.planned <= 0) {
      return {
        detail: "No expected income is set for this month.",
        title: "Income received"
      };
    }
    return {
      detail: row.remaining > 0
        ? `${formatCompactRupiah(remainingAmount)} expected income is not logged yet.`
        : `Income is ${formatCompactRupiah(remainingAmount)} above plan.`,
      title: "Income received"
    };
  }

  if (row.key === "fixed") {
    if (row.planned <= 0) {
      return {
        detail: "No fixed-cost envelope is set.",
        title: "Fixed costs"
      };
    }
    return {
      detail: row.remaining >= 0
        ? `${formatCompactRupiah(remainingAmount)} fixed-cost room remains.`
        : `Fixed costs are ${formatCompactRupiah(remainingAmount)} above plan.`,
      title: "Fixed costs"
    };
  }

  if (row.key === "flexible") {
    if (row.planned <= 0) {
      return {
        detail: "No flexible spending envelope is set.",
        title: "Flexible spending"
      };
    }
    return {
      detail: row.remaining >= 0
        ? `${formatCompactRupiah(remainingAmount)} flexible spending remains.`
        : `Flexible spending is ${formatCompactRupiah(remainingAmount)} above plan.`,
      title: "Flexible spending"
    };
  }

  if (row.planned <= 0) {
    return {
      detail: "No savings target is set.",
      title: "Savings target"
    };
  }

  return {
    detail: row.remaining > 0
      ? `${formatCompactRupiah(remainingAmount)} still needed to hit the savings target.`
      : `Net left is ${formatCompactRupiah(remainingAmount)} above target.`,
    title: "Savings target"
  };
}

export function getReconciliationCopy(rows: AccountReconciliationRow[]): {
  detail: string;
  title: string;
  tone: SpendingPattern["tone"];
} {
  const rowsWithSnapshots = rows.filter((row) => row.status !== "no_snapshot");
  const reviewRows = rows.filter((row) => row.status === "needs_review");
  const smallGapRows = rows.filter((row) => row.status === "small_gap");
  const historyRows = rows.filter((row) => row.status === "needs_history");
  const totalGap = rows.reduce((sum, row) => sum + Math.abs(row.difference ?? 0), 0);

  if (rowsWithSnapshots.length === 0) {
    return {
      detail: "Add balance snapshots first. Reconciliation becomes useful after two snapshots for the same account.",
      title: "No balance check yet",
      tone: "calm"
    };
  }

  if (reviewRows.length > 0) {
    return {
      detail: `${reviewRows.length} account${reviewRows.length === 1 ? "" : "s"} need checking. Total visible gap is ${formatCompactRupiah(totalGap)}.`,
      title: "Some balances need review",
      tone: "notice"
    };
  }

  if (smallGapRows.length > 0) {
    return {
      detail: `${smallGapRows.length} account${smallGapRows.length === 1 ? "" : "s"} have small gaps. They may be fees, rounding, or one missing entry.`,
      title: "Small balance gaps are visible",
      tone: "warm"
    };
  }

  if (historyRows.length > 0) {
    return {
      detail: "At least one account has only one snapshot. Add the next snapshot to compare logged movement.",
      title: "One more snapshot will unlock checks",
      tone: "calm"
    };
  }

  return {
    detail: "Latest snapshots match the movement logged between balance checks.",
    title: "Logged movement matches balances",
    tone: "calm"
  };
}

export function formatReconciliationDifference(row: AccountReconciliationRow): string {
  if (row.status === "no_snapshot") return "No snapshot";
  if (row.status === "needs_history") return "Need 2 snapshots";
  if (row.difference === null || Math.abs(row.difference) <= 1000) return "Matched";
  return formatSignedCompactRupiah(row.difference);
}

export function getReconciliationDetail(row: AccountReconciliationRow): string {
  if (row.status === "no_snapshot") {
    return "Add a manual balance snapshot for this account.";
  }

  if (row.status === "needs_history") {
    return "Add one more snapshot later; Slev will compare the movement between both checks.";
  }

  const movement = `Logged movement over ${row.daysCovered} day${row.daysCovered === 1 ? "" : "s"}: income ${formatCompactRupiah(row.income)}, spending ${formatCompactRupiah(row.expense)}, transfer in ${formatCompactRupiah(row.transferIn)}, transfer out ${formatCompactRupiah(row.transferOut)}.`;
  if (row.difference === null || Math.abs(row.difference) <= 1000) {
    return movement;
  }

  const gap = formatCompactRupiah(Math.abs(row.difference));
  const direction = row.difference > 0
    ? `Actual balance is ${gap} higher than expected. Check missing income, transfer in, or an overstated expense.`
    : `Actual balance is ${gap} lower than expected. Check missing expense, transfer out, or a balance typo.`;

  return `${direction} ${movement}`;
}

export function buildAccountActivity(moments: SpendingMoment[]): AccountActivityRow[] {
  const range = getMonthRange(new Date(), 0);
  const grouped = moments
    .filter((moment) => isWithinRange(moment.occurredAt, range.start, range.end))
    .reduce<Record<string, AccountActivityRow>>((acc, moment) => {
      const label = moment.accountLabel || "Unassigned";
      const current = acc[label] ?? {
        expense: 0,
        income: 0,
        label,
        net: 0,
        share: 0
      };
      const income = current.income + (moment.type === "income" ? moment.amount : 0);
      const expense = current.expense + (moment.type === "expense" ? moment.amount : 0);
      acc[label] = {
        ...current,
        expense,
        income,
        net: income - expense
      };
      return acc;
    }, {});
  const rows = Object.values(grouped).sort((a, b) => b.expense - a.expense);
  const maxExpense = Math.max(1, ...rows.map((row) => row.expense));
  return rows.map((row) => ({
    ...row,
    share: row.expense / maxExpense
  }));
}

export function buildCashflowWeeks(moments: SpendingMoment[]): CashflowWeek[] {
  const currentWeekStart = getStartOfWeek(new Date());
  return Array.from({ length: 8 }, (_, index) => {
    const start = new Date(currentWeekStart.getTime() - (7 - index) * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weekMoments = moments.filter((moment) => isWithinRange(moment.occurredAt, start, end));
    const income = sumMoments(weekMoments.filter((moment) => moment.type === "income"));
    const expense = sumExpenseMoments(weekMoments);
    return {
      expense,
      income,
      key: dateKey(start),
      label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      net: income - expense
    };
  });
}

export function buildSpendingTrend(moments: SpendingMoment[]): SpendingTrend {
  const today = new Date();
  const months = [-2, -1, 0].map((offset) => {
    const range = getMonthRange(today, offset);
    const amount = sumExpenseMoments(
      moments.filter((moment) => isWithinRange(moment.occurredAt, range.start, range.end))
    );
    return {
      amount,
      key: dateKey(range.start),
      label: range.start.toLocaleDateString("en-US", { month: "short" }),
      share: 0
    };
  });
  const maxAmount = Math.max(1, ...months.map((month) => month.amount));
  const monthsWithShare = months.map((month) => ({
    ...month,
    share: month.amount / maxAmount
  }));
  const currentMonth = monthsWithShare[2];
  const lastMonth = monthsWithShare[1];
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const expectedPace = lastMonth.amount * (dayOfMonth / daysInMonth);
  const midpointMessage =
    dayOfMonth >= Math.ceil(daysInMonth / 2) && lastMonth.amount > 0 && currentMonth.amount > expectedPace
      ? `${currentMonth.label} is running above last month's pace at this point.`
      : undefined;
  const currentRange = getMonthRange(today, 0);
  const topCategories = buildMonthlyBreakdown(
    moments.filter((moment) => isWithinRange(moment.occurredAt, currentRange.start, currentRange.end)),
    "expense"
  )
    .slice(0, 2)
    .map((row) => ({ amount: row.amount, label: row.label }));

  return {
    midpointMessage,
    months: monthsWithShare,
    topCategories
  };
}

export function getMomentsInPeriod(
  moments: SpendingMoment[],
  period: BudgetPeriod,
  referenceDate = new Date()
): SpendingMoment[] {
  const range = period === "weekly" ? getWeekRange(referenceDate) : getMonthRange(referenceDate, 0);
  return moments.filter((moment) => isWithinRange(moment.occurredAt, range.start, range.end));
}

export function sumExpenseMoments(moments: SpendingMoment[]): number {
  return sumMoments(moments.filter((moment) => moment.type === "expense"));
}

export function sumMoments(moments: SpendingMoment[]): number {
  return moments.reduce((sum, moment) => sum + moment.amount, 0);
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function getPercentWidthStyle(value: number): { width: `${number}%` } {
  const clamped = clampPercent(value);
  const width = clamped > 0 && clamped < 0.02 ? 2 : Math.round(clamped * 100);
  return { width: `${width}%` };
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

export function getStartOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + offset);
  return start;
}

export function getMonthRange(date: Date, monthOffset: number): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
  const end = new Date(date.getFullYear(), date.getMonth() + monthOffset + 1, 1);
  return { start, end };
}

export function isWithinRange(value: string, start: Date, end: Date): boolean {
  const time = Date.parse(value);
  return time >= start.getTime() && time < end.getTime();
}

export function getRepeatSuggestions(moments: SpendingMoment[]): RepeatSuggestion[] {
  const seen = new Set<string>();
  const suggestions: RepeatSuggestion[] = [];

  for (const moment of moments) {
    if (moment.type === "income") continue;
    const label = moment.label || moment.context;
    const key = `${label.toLowerCase()}-${moment.context}`;
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push({
      accountLabel: moment.accountLabel,
      amount: moment.amount,
      context: moment.context,
      label
    });
    if (suggestions.length >= 4) break;
  }

  return suggestions;
}

export function filterMoments(moments: SpendingMoment[], query: string): SpendingMoment[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return moments;

  return moments.filter((moment) => {
    const haystack = [
      moment.label,
      moment.source,
      moment.accountLabel,
      moment.type,
      moment.context,
      moment.note,
      String(moment.amount),
      formatCompactRupiah(moment.amount)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function getRepeatHint(moment: SpendingMoment, moments: SpendingMoment[]): string | undefined {
  if (moment.type === "income") return undefined;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const count = moments.filter(
    (item) => item.type === "expense" && item.context === moment.context && Date.parse(item.occurredAt) >= weekAgo
  ).length;
  return count >= 3 ? `${count} this week` : undefined;
}

export function buildRepeatHints(moments: SpendingMoment[]): Map<string, string> {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const contextCounts = new Map<SpendingContext, number>();

  for (const item of moments) {
    if (item.type === "expense" && Date.parse(item.occurredAt) >= weekAgo) {
      contextCounts.set(item.context, (contextCounts.get(item.context) ?? 0) + 1);
    }
  }

  const hints = new Map<string, string>();
  for (const moment of moments) {
    if (moment.type === "income") continue;
    const count = contextCounts.get(moment.context) ?? 0;
    if (count >= 3) {
      hints.set(moment.id, `${count} this week`);
    }
  }

  return hints;
}

export function groupMomentsByRecallRange(moments: SpendingMoment[]) {
  const now = new Date();
  const todayKey = dateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const groups = [
    { key: "today", label: "Today", items: [] as SpendingMoment[] },
    { key: "yesterday", label: "Yesterday", items: [] as SpendingMoment[] },
    { key: "this-week", label: "This week", items: [] as SpendingMoment[] },
    { key: "earlier", label: "Earlier", items: [] as SpendingMoment[] }
  ];

  moments.forEach((moment) => {
    const key = dateKey(new Date(moment.occurredAt));
    const time = Date.parse(moment.occurredAt);
    if (key === todayKey) {
      groups[0].items.push(moment);
    } else if (key === yesterdayKey) {
      groups[1].items.push(moment);
    } else if (time >= weekAgo) {
      groups[2].items.push(moment);
    } else {
      groups[3].items.push(moment);
    }
  });

  return groups.filter((group) => group.items.length > 0);
}

export function groupPatterns(patterns: SpendingPattern[]) {
  const byGroup = patterns.reduce<Record<string, SpendingPattern[]>>((acc, pattern) => {
    acc[pattern.group] = [...(acc[pattern.group] ?? []), pattern];
    return acc;
  }, {});

  return Object.entries(byGroup).map(([title, items]) => ({ title, items }));
}

export function formatDate(key: string): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

export function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function getIncomeHubLabel(accounts: MoneyAccount[]): string {
  return accounts.find((account) => account.isIncomeHub)?.label ?? accounts[0]?.label ?? "BRI";
}

export function getDailyPocketLabel(accounts: MoneyAccount[]): string {
  return accounts.find((account) => !account.isIncomeHub)?.label ?? accounts[0]?.label ?? "Jago";
}

export function getDefaultMomentAccount(type: EntryType, accounts: MoneyAccount[]): string {
  return type === "income" ? getIncomeHubLabel(accounts) : getDailyPocketLabel(accounts);
}