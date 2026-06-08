import { RecurringBill } from "../features/spendingMemory.types";

export function getMonthlyBillsTotal(bills: RecurringBill[]): number {
  return bills
    .filter((bill) => bill.active)
    .reduce((sum, bill) => sum + bill.amount, 0);
}