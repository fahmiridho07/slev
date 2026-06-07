import {
  BudgetPeriod,
  EntryType,
  ManualTemplate,
  MoneyAccount,
  SpendingContext,
  SpendingMoment,
  SpendingPattern
} from "../features/spendingMemory.types";
import { formatString } from "../i18n/format";
import {
  formatLocaleMonthShort,
  formatLocaleShortDate,
  formatLocaleTime,
  formatLocaleWeekdayDate
} from "../i18n/localeDate";
import { getRuntimeStrings } from "../i18n/runtime";
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
  if (moment.type === "income") {
    return moment.source || moment.label || getRuntimeStrings().memory.momentTitle.income;
  }
  return moment.label || moment.context;
}

export function getTemplateLabel(template: ManualTemplate): string {
  if (template.type === "income") {
    return template.source || getRuntimeStrings().memory.momentTitle.income;
  }
  return template.label || template.context;
}

export function getAllocationActionCopy(allocation: AllocationPlan): {
  detail: string;
  title: string;
  tone: SpendingPattern["tone"];
} {
  const amount = allocation.nextAction.amount ?? 0;
  const strings = getRuntimeStrings().analysis.allocation.action;

  switch (allocation.nextAction.kind) {
    case "set_plan":
      return {
        detail: strings.setPlan.detail,
        title: strings.setPlan.title,
        tone: "calm"
      };
    case "snapshot_balances":
      return {
        detail: strings.snapshotBalances.detail,
        title: strings.snapshotBalances.title,
        tone: "calm"
      };
    case "plan_exceeds_income":
      return {
        detail: formatString(strings.planExceedsIncome.detail, {
          amount: formatCompactRupiah(amount)
        }),
        title: strings.planExceedsIncome.title,
        tone: "notice"
      };
    case "flexible_over_plan":
      return {
        detail: formatString(strings.flexibleOverPlan.detail, {
          amount: formatCompactRupiah(amount)
        }),
        title: strings.flexibleOverPlan.title,
        tone: "notice"
      };
    case "top_up_pockets":
      return {
        detail: formatString(strings.topUpPockets.detail, {
          amount: formatCompactRupiah(amount),
          hubBalance: formatCompactRupiah(allocation.hubBalance)
        }),
        title: strings.topUpPockets.title,
        tone: "warm"
      };
    case "hold":
      return {
        detail: strings.hold.detail,
        title: strings.hold.title,
        tone: "calm"
      };
  }
}

export function getAllocationRowCopy(row: AllocationPlan["rows"][number]): {
  detail: string;
  title: string;
} {
  const remainingAmount = Math.abs(row.remaining);
  const strings = getRuntimeStrings().analysis.allocation.row;

  if (row.key === "income") {
    if (row.planned <= 0) {
      return {
        detail: strings.incomeNoPlan,
        title: strings.incomeTitle
      };
    }
    return {
      detail: row.remaining > 0
        ? formatString(strings.incomeRemaining, { amount: formatCompactRupiah(remainingAmount) })
        : formatString(strings.incomeAbovePlan, { amount: formatCompactRupiah(remainingAmount) }),
      title: strings.incomeTitle
    };
  }

  if (row.key === "fixed") {
    if (row.planned <= 0) {
      return {
        detail: strings.fixedNoPlan,
        title: strings.fixedTitle
      };
    }
    return {
      detail: row.remaining >= 0
        ? formatString(strings.fixedRemaining, { amount: formatCompactRupiah(remainingAmount) })
        : formatString(strings.fixedAbovePlan, { amount: formatCompactRupiah(remainingAmount) }),
      title: strings.fixedTitle
    };
  }

  if (row.key === "flexible") {
    if (row.planned <= 0) {
      return {
        detail: strings.flexibleNoPlan,
        title: strings.flexibleTitle
      };
    }
    return {
      detail: row.remaining >= 0
        ? formatString(strings.flexibleRemaining, { amount: formatCompactRupiah(remainingAmount) })
        : formatString(strings.flexibleAbovePlan, { amount: formatCompactRupiah(remainingAmount) }),
      title: strings.flexibleTitle
    };
  }

  if (row.planned <= 0) {
    return {
      detail: strings.savingsNoPlan,
      title: strings.savingsTitle
    };
  }

  return {
    detail: row.remaining > 0
      ? formatString(strings.savingsStillNeeded, { amount: formatCompactRupiah(remainingAmount) })
      : formatString(strings.savingsAboveTarget, { amount: formatCompactRupiah(remainingAmount) }),
    title: strings.savingsTitle
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
  const strings = getRuntimeStrings().analysis.reconciliation.summary;

  if (rowsWithSnapshots.length === 0) {
    return {
      detail: strings.noSnapshot.detail,
      title: strings.noSnapshot.title,
      tone: "calm"
    };
  }

  if (reviewRows.length > 0) {
    return {
      detail: formatString(strings.needsReview.detail, {
        count: reviewRows.length,
        totalGap: formatCompactRupiah(totalGap)
      }),
      title: strings.needsReview.title,
      tone: "notice"
    };
  }

  if (smallGapRows.length > 0) {
    return {
      detail: formatString(strings.smallGap.detail, { count: smallGapRows.length }),
      title: strings.smallGap.title,
      tone: "warm"
    };
  }

  if (historyRows.length > 0) {
    return {
      detail: strings.needsHistory.detail,
      title: strings.needsHistory.title,
      tone: "calm"
    };
  }

  return {
    detail: strings.matched.detail,
    title: strings.matched.title,
    tone: "calm"
  };
}

export function formatReconciliationDifference(row: AccountReconciliationRow): string {
  const strings = getRuntimeStrings().analysis.reconciliation.status;
  if (row.status === "no_snapshot") return strings.noSnapshot;
  if (row.status === "needs_history") return strings.needsHistory;
  if (row.difference === null || Math.abs(row.difference) <= 1000) return strings.matched;
  return formatSignedCompactRupiah(row.difference);
}

export function getReconciliationDetail(row: AccountReconciliationRow): string {
  const strings = getRuntimeStrings().analysis.reconciliation.detail;
  if (row.status === "no_snapshot") {
    return strings.noSnapshot;
  }

  if (row.status === "needs_history") {
    return strings.needsHistory;
  }

  const movement = formatString(strings.movement, {
    days: row.daysCovered,
    income: formatCompactRupiah(row.income),
    expense: formatCompactRupiah(row.expense),
    transferIn: formatCompactRupiah(row.transferIn),
    transferOut: formatCompactRupiah(row.transferOut)
  });
  if (row.difference === null || Math.abs(row.difference) <= 1000) {
    return movement;
  }

  const gap = formatCompactRupiah(Math.abs(row.difference));
  const direction = row.difference > 0
    ? formatString(strings.higherThanExpected, { gap })
    : formatString(strings.lowerThanExpected, { gap });

  return `${direction} ${movement}`;
}

export function buildAccountActivity(moments: SpendingMoment[]): AccountActivityRow[] {
  const range = getMonthRange(new Date(), 0);
  const grouped = moments
    .filter((moment) => isWithinRange(moment.occurredAt, range.start, range.end))
    .reduce<Record<string, AccountActivityRow>>((acc, moment) => {
      const label = moment.accountLabel || getRuntimeStrings().analysis.accounts.unassigned;
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
      label: formatLocaleShortDate(start),
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
      label: formatLocaleMonthShort(range.start),
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
      ? formatString(getRuntimeStrings().analysis.trends.midpointPace, { month: currentMonth.label })
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

export function getFrequentAccountLabels(
  moments: SpendingMoment[],
  accounts: MoneyAccount[],
  limit = 4
): string[] {
  const validLabels = new Set(accounts.map((account) => account.label));
  const usage = new Map<string, { count: number; latestAt: string }>();

  for (const moment of moments) {
    const label = moment.accountLabel;
    if (!label || !validLabels.has(label)) continue;

    const current = usage.get(label);
    if (!current) {
      usage.set(label, { count: 1, latestAt: moment.occurredAt });
      continue;
    }

    current.count += 1;
    if (moment.occurredAt > current.latestAt) {
      current.latestAt = moment.occurredAt;
    }
  }

  const ranked = [...usage.entries()]
    .sort((left, right) => {
      if (right[1].count !== left[1].count) {
        return right[1].count - left[1].count;
      }
      return right[1].latestAt.localeCompare(left[1].latestAt);
    })
    .map(([label]) => label);

  const result: string[] = [];
  const seen = new Set<string>();

  for (const label of ranked) {
    if (result.length >= limit) break;
    if (seen.has(label)) continue;
    seen.add(label);
    result.push(label);
  }

  for (const account of accounts) {
    if (result.length >= limit) break;
    if (seen.has(account.label)) continue;
    seen.add(account.label);
    result.push(account.label);
  }

  return result;
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
  return count >= 3
    ? formatString(getRuntimeStrings().memory.repeatHint, { count })
    : undefined;
}

export function buildRepeatHints(moments: SpendingMoment[]): Map<string, string> {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const contextCounts = new Map<SpendingContext, number>();

  for (const item of moments) {
    if (item.type === "expense" && Date.parse(item.occurredAt) >= weekAgo) {
      contextCounts.set(item.context, (contextCounts.get(item.context) ?? 0) + 1);
    }
  }

  const repeatHintTemplate = getRuntimeStrings().memory.repeatHint;
  const hints = new Map<string, string>();
  for (const moment of moments) {
    if (moment.type === "income") continue;
    const count = contextCounts.get(moment.context) ?? 0;
    if (count >= 3) {
      hints.set(moment.id, formatString(repeatHintTemplate, { count }));
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
  const groupLabels = getRuntimeStrings().memory.groups;
  const groups = [
    { key: "today", label: groupLabels.today, items: [] as SpendingMoment[] },
    { key: "yesterday", label: groupLabels.yesterday, items: [] as SpendingMoment[] },
    { key: "this-week", label: groupLabels.thisWeek, items: [] as SpendingMoment[] },
    { key: "earlier", label: groupLabels.earlier, items: [] as SpendingMoment[] }
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
  return formatLocaleWeekdayDate(key);
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
  return formatLocaleTime(value);
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