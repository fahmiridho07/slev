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
import { formatLocaleTime, formatLocaleWeekdayDate } from "../i18n/localeDate";
import { getRuntimeStrings } from "../i18n/runtime";
import { getMonthRange, isWithinRange, sumMoments } from "./dateRanges";
import { formatRupiah } from "./spendingMemoryPatterns";

export { getMonthRange, isWithinRange, sumMoments } from "./dateRanges";

export type DataMaturity = "building" | "established" | "new";

export type TrackerSegment = "cashflow" | "expense" | "income";

export type TrackerEmptyReason = "empty_month" | "early_building" | "early_new";

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

export function getDataMaturity(moments: SpendingMoment[], referenceDate = new Date()): DataMaturity {
  if (moments.length === 0) {
    return "new";
  }

  const timestamps = moments
    .map((moment) => Date.parse(moment.occurredAt))
    .filter((time) => !Number.isNaN(time));

  if (timestamps.length === 0) {
    return "new";
  }

  const minTs = Math.min(...timestamps);
  const maxTs = Math.max(...timestamps);
  const spanDays = (maxTs - minTs) / (24 * 60 * 60 * 1000);
  const expenseMonthKeys = new Set(
    moments
      .filter((moment) => moment.type === "expense")
      .map((moment) => getMonthKey(new Date(moment.occurredAt)))
  );
  const currentMonthKey = getMonthKey(referenceDate);

  if (spanDays >= 30 || expenseMonthKeys.size >= 2) {
    return "established";
  }

  if (moments.length < 5 && spanDays < 7 && expenseMonthKeys.size <= 1 && expenseMonthKeys.has(currentMonthKey)) {
    return "new";
  }

  return "building";
}

export function getMonthMoments(moments: SpendingMoment[], referenceDate: Date): SpendingMoment[] {
  const { start, end } = getMonthRange(referenceDate, 0);
  return moments.filter((moment) => isWithinRange(moment.occurredAt, start, end));
}

export function getTrackerEmptyReason(
  moments: SpendingMoment[],
  referenceDate: Date,
  segment: TrackerSegment
): TrackerEmptyReason | null {
  const monthMoments = getMonthMoments(moments, referenceDate);
  const relevant =
    segment === "cashflow"
      ? monthMoments.filter((moment) => moment.type === "income" || moment.type === "expense")
      : monthMoments.filter((moment) => moment.type === segment);

  if (relevant.length === 0) {
    return "empty_month";
  }

  const maturity = getDataMaturity(moments, referenceDate);
  if (maturity === "new") {
    return "early_new";
  }

  if (maturity === "building" && relevant.length < 3) {
    return "early_building";
  }

  return null;
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

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function getPercentHeightStyle(value: number): { height: `${number}%` } {
  const clamped = clampPercent(value);
  const height = clamped > 0 && clamped < 0.02 ? 2 : Math.round(clamped * 100);
  return { height: `${height}%` };
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
      formatRupiah(moment.amount)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
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