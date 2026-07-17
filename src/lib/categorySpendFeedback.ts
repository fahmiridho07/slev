import { ExpenseCategory, SpendingContext, SpendingMoment } from "../features/spendingMemory.types";
import { getMonthRange, isWithinRange } from "./dateRanges";

export type CategorySpendFeedback = {
  /** Expense total for this category in the reference month, before the draft amount. */
  spentThisMonth: number;
  /** The optional monthly guide configured for the category, when set. */
  monthlyGuide: number | null;
  /** Amount left of the guide after the draft amount; negative means over. */
  remainingAfterDraft: number | null;
  /** Positive amount past the guide after the draft; null when within the guide or no guide. */
  overBy: number | null;
};

export function buildCategorySpendFeedback({
  categories,
  context,
  draftAmount = 0,
  moments,
  referenceDate = new Date()
}: {
  categories: ExpenseCategory[];
  context: SpendingContext;
  draftAmount?: number;
  moments: SpendingMoment[];
  referenceDate?: Date;
}): CategorySpendFeedback {
  const range = getMonthRange(referenceDate, 0);
  const spentThisMonth = moments.reduce((sum, moment) => {
    if (moment.type !== "expense" || moment.context !== context) {
      return sum;
    }
    return isWithinRange(moment.occurredAt, range.start, range.end) ? sum + moment.amount : sum;
  }, 0);

  const guide = categories.find((category) => category.label === context)?.monthlyGuide;
  const monthlyGuide = typeof guide === "number" && guide > 0 ? guide : null;
  const remainingAfterDraft = monthlyGuide === null ? null : monthlyGuide - spentThisMonth - draftAmount;
  const overBy = remainingAfterDraft !== null && remainingAfterDraft < 0 ? -remainingAfterDraft : null;

  return { monthlyGuide, overBy, remainingAfterDraft, spentThisMonth };
}
