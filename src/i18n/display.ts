import { ExpenseCategory, SpendingContext } from "../features/spendingMemory.types";
import type { AppStrings } from "./types";
import { getRuntimeStrings } from "./runtime";

export function displayContext(context: SpendingContext): string {
  const labels = getRuntimeStrings().capture.contextLabels;
  if (context in labels) {
    return labels[context as keyof typeof labels];
  }
  return context;
}

export function getCategoryHint(
  context: SpendingContext,
  categories: ExpenseCategory[],
  strings: AppStrings = getRuntimeStrings()
): string {
  const stored = categories.find((category) => category.label === context);
  if (stored?.hint?.trim()) {
    return stored.hint.trim();
  }

  const hints = strings.capture.contextHints;
  if (context in hints && context !== "custom") {
    return hints[context as keyof typeof hints];
  }

  return hints.custom;
}