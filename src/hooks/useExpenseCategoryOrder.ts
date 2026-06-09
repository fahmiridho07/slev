import { useCallback, useMemo } from "react";
import { useCapturePickerOrder } from "./useCapturePickerOrder";
import { reorderItemsByKey } from "../lib/applyItemOrder";
import { hapticSelection } from "../lib/haptics";
import { ExpenseCategory, MoneyAccount, SpendingContext } from "../features/spendingMemory.types";

export function useExpenseCategoryOrder(categories: ExpenseCategory[], accounts: MoneyAccount[]) {
  const categoryLabels = useMemo(
    () => categories.map((category) => category.label),
    [categories]
  );
  const { orderedCategories, reorderCategories } = useCapturePickerOrder(categoryLabels, accounts);
  const categoryByLabel = useMemo(
    () => new Map(categories.map((category) => [category.label, category])),
    [categories]
  );
  const orderedExpenseCategories = useMemo(
    () =>
      orderedCategories
        .map((label) => categoryByLabel.get(label))
        .filter((category): category is ExpenseCategory => category !== undefined),
    [categoryByLabel, orderedCategories]
  );

  const moveCategory = useCallback(
    (label: SpendingContext, direction: "up" | "down") => {
      const index = orderedCategories.indexOf(label);
      if (index < 0) {
        return;
      }
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= orderedCategories.length) {
        return;
      }
      hapticSelection();
      reorderCategories(
        reorderItemsByKey(
          orderedCategories,
          label,
          orderedCategories[targetIndex] as SpendingContext,
          (item) => item
        )
      );
    },
    [orderedCategories, reorderCategories]
  );

  const getCategoryOrderState = useCallback(
    (label: SpendingContext) => {
      const index = orderedCategories.indexOf(label);
      return {
        canMoveEarlier: index > 0,
        canMoveLater: index >= 0 && index < orderedCategories.length - 1,
        moveEarlier: () => moveCategory(label, "up"),
        moveLater: () => moveCategory(label, "down")
      };
    },
    [moveCategory, orderedCategories]
  );

  return {
    getCategoryOrderState,
    orderedExpenseCategories
  };
}