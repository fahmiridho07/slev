import { EntryType, SpendingMoment } from "../features/spendingMemory.types";
import { displayContext } from "../i18n/display";
import { getRuntimeStrings } from "../i18n/runtime";
import { getMonthRange, isWithinRange, sumMoments } from "./dateRanges";

export type FinanceBreakdownRow = {
  amount: number;
  key: string;
  label: string;
  share: number;
};

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
        ? moment.accountLabel || getRuntimeStrings().analysis.accounts.unassigned
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

export function buildMonthlyIncomeBySource(
  moments: SpendingMoment[],
  referenceDate = new Date()
): FinanceBreakdownRow[] {
  const currentMonth = getMonthRange(referenceDate, 0);
  const filtered = moments.filter(
    (moment) => moment.type === "income" && isWithinRange(moment.occurredAt, currentMonth.start, currentMonth.end)
  );
  const total = sumMoments(filtered);
  const fallbackLabel = getRuntimeStrings().memory.momentTitle.income;
  const grouped = filtered.reduce<Record<string, number>>((acc, moment) => {
    const label = moment.source?.trim() || moment.label?.trim() || fallbackLabel;
    acc[label] = (acc[label] ?? 0) + moment.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([label, amount]) => ({
      amount,
      key: label,
      label,
      share: total > 0 ? amount / total : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getDaysRemainingInMonth(date: Date): number {
  const currentDay = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.max(1, daysInMonth - currentDay + 1);
}

/**
 * Returns the next payday date strictly after `date` (start-of-day). If the payday day
 * has already occurred this month (or is today), rolls to next month. Clamps to month
 * length so e.g. day 31 maps to Feb 28/29.
 */
export function getNextPaydayDate(date: Date, paydayDayOfMonth: number): Date {
  const day = Math.min(Math.max(Math.round(paydayDayOfMonth), 1), 31);
  const startOfToday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const paydayInMonth = (year: number, monthIndex: number): Date => {
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    return new Date(year, monthIndex, Math.min(day, lastDay));
  };
  let next = paydayInMonth(startOfToday.getFullYear(), startOfToday.getMonth());
  if (next.getTime() <= startOfToday.getTime()) {
    next = paydayInMonth(startOfToday.getFullYear(), startOfToday.getMonth() + 1);
  }
  return next;
}

export function getDaysUntilNextPayday(date: Date, paydayDayOfMonth: number): number {
  const startOfToday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const next = getNextPaydayDate(date, paydayDayOfMonth);
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.round((next.getTime() - startOfToday.getTime()) / msPerDay);
  return Math.max(1, days);
}

/**
 * Returns the next calendar date on or after `date` (start-of-day) whose day-of-month
 * equals `dayOfMonth`. Unlike getNextPaydayDate, a match that falls on today is returned
 * as-is (a bill due today is still upcoming). Clamps to month length.
 */
export function getNextOccurrenceOfDay(date: Date, dayOfMonth: number): Date {
  const day = Math.min(Math.max(Math.round(dayOfMonth), 1), 31);
  const startOfToday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayInMonth = (year: number, monthIndex: number): Date => {
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    return new Date(year, monthIndex, Math.min(day, lastDay));
  };
  let next = dayInMonth(startOfToday.getFullYear(), startOfToday.getMonth());
  if (next.getTime() < startOfToday.getTime()) {
    next = dayInMonth(startOfToday.getFullYear(), startOfToday.getMonth() + 1);
  }
  return next;
}