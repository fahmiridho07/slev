import { getBillNeedFieldsToast, getCategoryNeedNameToast } from "../../i18n";
import { FormValidationError } from "../../lib/formValidation";
import { parseAmountInput } from "../../lib/formatMoney";

export type CategoryFieldError = "label";

export function getCategoryValidationError(label: string): FormValidationError<CategoryFieldError> | null {
  if (!label.trim()) {
    return { field: "label", message: getCategoryNeedNameToast() };
  }
  return null;
}

export type BillFieldError = "label" | "amount";

export function getBillValidationError(input: {
  label: string;
  amount: string;
}): FormValidationError<BillFieldError> | null {
  const amount = parseAmountInput(input.amount);
  if (!input.label.trim() || !amount) {
    return { field: !input.label.trim() ? "label" : "amount", message: getBillNeedFieldsToast() };
  }

  return null;
}