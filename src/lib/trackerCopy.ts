import { AppStrings } from "../i18n/types";
import { TrackerEmptyReason, TrackerSegment } from "./analysis";

export function getTrackerEmptyCopy(
  reason: TrackerEmptyReason,
  segment: TrackerSegment,
  trackerStrings: AppStrings["patterns"]["tracker"]
): string {
  if (segment === "cashflow") {
    if (reason === "empty_month") {
      return trackerStrings.cashflowEmptyMonth;
    }
    if (reason === "early_new") {
      return trackerStrings.cashflowEarlyNew;
    }
    return trackerStrings.cashflowEarlyBuilding;
  }

  if (segment === "expense") {
    if (reason === "empty_month") {
      return trackerStrings.expenseEmptyMonth;
    }
    if (reason === "early_new") {
      return trackerStrings.expenseEarlyNew;
    }
    return trackerStrings.expenseEarlyBuilding;
  }

  if (reason === "empty_month") {
    return trackerStrings.incomeEmptyMonth;
  }
  if (reason === "early_new") {
    return trackerStrings.incomeEarlyNew;
  }
  return trackerStrings.incomeEarlyBuilding;
}