import { getMemoryNeedAmountToast, getShortcutNeedLabelToast } from "../../i18n";
import { FormValidationError } from "../../lib/formValidation";
import { parseAmountInput } from "../../lib/formatMoney";
import { EntryType } from "../spendingMemory.types";

export type MemoryFieldError = "amount" | "label";

type MemoryEditInput = {
  amountText: string;
  label: string;
  source: string;
  type: EntryType;
};

export function getMemoryEditValidationError(
  input: MemoryEditInput | string
): FormValidationError<MemoryFieldError> | null {
  const values = typeof input === "string" ? { amountText: input, label: "", source: "", type: "expense" as const } : input;
  const amount = parseAmountInput(values.amountText);
  if (!amount) {
    return { field: "amount", message: getMemoryNeedAmountToast() };
  }

  const descriptor = values.type === "income" ? values.source.trim() : values.label.trim();
  if (!descriptor) {
    return { field: "label", message: getShortcutNeedLabelToast() };
  }

  return null;
}