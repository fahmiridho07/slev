import { EntryType, SpendingMoment } from "../features/spendingMemory.types";
import { getRuntimeStrings } from "../i18n/runtime";
import { getMonthRange, isWithinRange } from "./analysis";

export type BreakdownFilterType = EntryType | "account" | "income_source";

export function filterBreakdownMoments(
  moments: SpendingMoment[],
  type: BreakdownFilterType,
  rowKey: string,
  referenceDate: Date
): SpendingMoment[] {
  const range = getMonthRange(referenceDate, 0);
  const fallbackIncomeSource = getRuntimeStrings().memory.momentTitle.income;

  return moments
    .filter((moment) => {
      if (!isWithinRange(moment.occurredAt, range.start, range.end)) {
        return false;
      }
      if (type === "account") {
        if (moment.type !== "expense") {
          return false;
        }
        const accountLabel = moment.accountLabel || getRuntimeStrings().analysis.accounts.unassigned;
        return accountLabel === rowKey;
      }
      if (type === "income_source") {
        if (moment.type !== "income") {
          return false;
        }
        const source = moment.source?.trim() || moment.label?.trim() || fallbackIncomeSource;
        return source === rowKey;
      }
      if (moment.type !== type) {
        return false;
      }
      if (type === "expense") {
        return moment.context === rowKey;
      }

      const accountLabel = moment.accountLabel || getRuntimeStrings().analysis.accounts.unassigned;
      return accountLabel === rowKey;
    })
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));
}