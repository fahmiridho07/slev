import { RecurringBill } from "../features/spendingMemory.types";
import { dateKey, getMonthKey } from "./analysis";

export type UpcomingBill = {
  bill: RecurringBill;
  dueDate: string;
  daysUntil: number;
};

export function getUpcomingBills({
  bills,
  referenceDate = new Date(),
  horizonDays = 14
}: {
  bills: RecurringBill[];
  referenceDate?: Date;
  horizonDays?: number;
}): UpcomingBill[] {
  const todayKey = dateKey(referenceDate);
  const upcoming = bills
    .filter((bill) => bill.active)
    .map((bill) => {
      const dueDate = getNextDueDate(bill, referenceDate);
      if (!dueDate) return null;

      const dueDateKey = dateKey(dueDate);
      const daysUntil = getLocalDayDistance(referenceDate, dueDate);
      if (daysUntil < 0 || daysUntil > horizonDays) {
        return null;
      }

      return {
        bill,
        dueDate: dueDate.toISOString(),
        daysUntil,
        dueDateKey
      };
    })
    .filter((item): item is UpcomingBill & { dueDateKey: string } => item !== null)
    .sort((a, b) => {
      if (a.dueDateKey !== b.dueDateKey) {
        return a.dueDateKey.localeCompare(b.dueDateKey);
      }
      return a.bill.label.localeCompare(b.bill.label);
    })
    .map(({ dueDateKey: _dueDateKey, ...item }) => item);

  return upcoming;
}

export function getMonthlyBillsTotal(bills: RecurringBill[]): number {
  return bills
    .filter((bill) => bill.active)
    .reduce((sum, bill) => sum + bill.amount, 0);
}

function getNextDueDate(bill: RecurringBill, referenceDate: Date): Date | null {
  const thisMonthDue = buildDueDate(referenceDate.getFullYear(), referenceDate.getMonth(), bill.dayOfMonth);
  const thisMonthKey = getMonthKey(thisMonthDue);

  if (
    !isBeforeLocalDay(thisMonthDue, referenceDate)
    && bill.lastPaidMonth !== thisMonthKey
  ) {
    return thisMonthDue;
  }

  const nextMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
  return buildDueDate(nextMonth.getFullYear(), nextMonth.getMonth(), bill.dayOfMonth);
}

function buildDueDate(year: number, monthIndex: number, dayOfMonth: number): Date {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const day = Math.min(Math.max(1, dayOfMonth), daysInMonth);
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

function isBeforeLocalDay(left: Date, right: Date): boolean {
  return dateKey(left) < dateKey(right);
}

function getLocalDayDistance(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}