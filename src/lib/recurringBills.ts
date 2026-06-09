import { RecurringBill, SpendingMoment } from "../features/spendingMemory.types";
import { getMonthRange, isWithinRange } from "./analysis";
import { getNextOccurrenceOfDay, getNextPaydayDate } from "./financeEngine";
import { RESERVED_BILL_CONTEXT } from "./safeToSpend";

export function getMonthlyBillsTotal(bills: RecurringBill[]): number {
  return bills
    .filter((bill) => bill.active)
    .reduce((sum, bill) => sum + bill.amount, 0);
}

/**
 * Reserve only the bills that fall due within the current spending horizon:
 *   - payday mode (paydayDayOfMonth provided): today → next payday date
 *   - month-end mode (no payday): today → last day of this month
 *
 * A bill with a `dueDay` is reserved only if its next occurrence (on or after today)
 * lands on/before the horizon end. A bill whose due day already passed this cycle is
 * assumed already paid (its next occurrence is next cycle, beyond the horizon) and is
 * not reserved — the real account balance is expected to already reflect that payment.
 *
 * Bills WITHOUT a `dueDay` are fully reserved, exactly like getMonthlyBillsTotal, so the
 * result is identical whenever no bill specifies a due day (existing setups unaffected).
 */
export function getBillsReserve(
  bills: RecurringBill[],
  referenceDate: Date = new Date(),
  paydayDayOfMonth?: number
): number {
  const horizonEnd =
    paydayDayOfMonth != null
      ? getNextPaydayDate(referenceDate, paydayDayOfMonth)
      : new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
  const horizonEndTime = horizonEnd.getTime();

  return bills
    .filter((bill) => bill.active)
    .reduce((sum, bill) => {
      if (bill.dueDay == null) {
        return sum + bill.amount;
      }
      const nextDue = getNextOccurrenceOfDay(referenceDate, bill.dueDay);
      return nextDue.getTime() <= horizonEndTime ? sum + bill.amount : sum;
    }, 0);
}

export function getUnloggedPastDueBills(
  bills: RecurringBill[],
  moments: SpendingMoment[],
  referenceDate = new Date()
): RecurringBill[] {
  const dayOfMonth = referenceDate.getDate();
  const monthRange = getMonthRange(referenceDate, 0);

  return bills.filter((bill) => {
    if (!bill.active || bill.dueDay == null || bill.dueDay >= dayOfMonth) {
      return false;
    }

    const paidThisMonth = moments.some(
      (moment) =>
        moment.type === "expense" &&
        moment.context === RESERVED_BILL_CONTEXT &&
        isWithinRange(moment.occurredAt, monthRange.start, monthRange.end) &&
        isBillPaymentMatch(moment, bill)
    );

    return !paidThisMonth;
  });
}

function isBillPaymentMatch(moment: SpendingMoment, bill: RecurringBill): boolean {
  const momentLabel = moment.label?.trim().toLowerCase();
  const billLabel = bill.label.trim().toLowerCase();
  if (momentLabel && momentLabel === billLabel) {
    return true;
  }
  return moment.amount === bill.amount && Boolean(momentLabel?.includes(billLabel));
}