import { MoneyAccount, MoneyTransfer, RecurringBill, SpendingMoment } from "../features/spendingMemory.types";
import { getTrackedTotalBalance } from "./accountLedger";
import { getUnloggedPastDueBills } from "./recurringBills";

export type HomeSetupHintType = "payday" | "opening_balance" | "bills" | "overdue_bills";

export type HomeSetupHint = {
  count?: number;
  type: HomeSetupHintType;
};

const HINT_PRIORITY: HomeSetupHintType[] = ["overdue_bills", "opening_balance", "payday", "bills"];

export function getPrimaryHomeSetupHint(input: {
  accounts: MoneyAccount[];
  moments: SpendingMoment[];
  paydayDayOfMonth: number | null;
  recurringBills: RecurringBill[];
  referenceDate?: Date;
  transfers: MoneyTransfer[];
}): HomeSetupHint | null {
  const hints = getHomeSetupHints(input);
  for (const type of HINT_PRIORITY) {
    const match = hints.find((hint) => hint.type === type);
    if (match) {
      return match;
    }
  }
  return null;
}

export function getHomeSetupHints({
  accounts,
  moments,
  paydayDayOfMonth,
  recurringBills,
  referenceDate = new Date(),
  transfers
}: {
  accounts: MoneyAccount[];
  moments: SpendingMoment[];
  paydayDayOfMonth: number | null;
  recurringBills: RecurringBill[];
  referenceDate?: Date;
  transfers: MoneyTransfer[];
}): HomeSetupHint[] {
  const hints: HomeSetupHint[] = [];

  if (paydayDayOfMonth == null) {
    hints.push({ type: "payday" });
  }

  const trackedTotal = getTrackedTotalBalance(accounts, moments, transfers);
  if (trackedTotal === 0 && moments.length === 0 && transfers.length === 0) {
    hints.push({ type: "opening_balance" });
  }

  if (!recurringBills.some((bill) => bill.active)) {
    hints.push({ type: "bills" });
  }

  const overdue = getUnloggedPastDueBills(recurringBills, moments, referenceDate);
  if (overdue.length > 0) {
    hints.push({ type: "overdue_bills", count: overdue.length });
  }

  return hints;
}