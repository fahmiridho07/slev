import { EntryType, SpendingMoment } from "../features/spendingMemory.types";
import { getRuntimeStrings } from "../i18n/runtime";
import { getMonthRange, isWithinRange } from "./analysis";

export function filterBreakdownMoments(
  moments: SpendingMoment[],
  type: EntryType,
  rowKey: string,
  referenceDate: Date
): SpendingMoment[] {
  const range = getMonthRange(referenceDate, 0);

  return moments
    .filter((moment) => {
      if (moment.type !== type) {
        return false;
      }
      if (!isWithinRange(moment.occurredAt, range.start, range.end)) {
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