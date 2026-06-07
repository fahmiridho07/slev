import { ExpenseCategory } from "../features/spendingMemory.types";
import { formatString } from "./format";
import { getRuntimeStrings } from "./runtime";

export function getCategoryDeleteMessage(category: ExpenseCategory): string {
  const strings = getRuntimeStrings();
  const template = category.isDefault
    ? strings.dialogs.categoryDeleteDefault
    : strings.dialogs.categoryDeleteCustom;
  return formatString(template, { label: category.label });
}