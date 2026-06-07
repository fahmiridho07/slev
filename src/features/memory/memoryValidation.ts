import { getMemoryNeedAmountToast } from "../../i18n";
import { FormValidationError } from "../../lib/formValidation";
import { parseAmountInput } from "../../lib/formatMoney";

export type MemoryFieldError = "amount";

export function getMemoryEditValidationError(amountText: string): FormValidationError<MemoryFieldError> | null {
  const amount = parseAmountInput(amountText);
  if (!amount) {
    return { field: "amount", message: getMemoryNeedAmountToast() };
  }
  return null;
}