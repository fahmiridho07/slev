import {
  getBillInvalidDayToast,
  getBillNeedFieldsToast,
  getCategoryNeedNameToast
} from "../../i18n";
import { FormValidationError } from "../../lib/formValidation";
import { parseAmountInput } from "../../lib/formatMoney";

export type CategoryFieldError = "label";

export function getCategoryValidationError(label: string): FormValidationError<CategoryFieldError> | null {
  if (!label.trim()) {
    return { field: "label", message: getCategoryNeedNameToast() };
  }
  return null;
}

export type BillFieldError = "label" | "amount" | "dayOfMonth";

export function getBillValidationError(input: {
  label: string;
  amount: string;
  dayOfMonth: string;
}): FormValidationError<BillFieldError> | null {
  const amount = parseAmountInput(input.amount);
  if (!input.label.trim() || !amount) {
    return { field: !input.label.trim() ? "label" : "amount", message: getBillNeedFieldsToast() };
  }

  const dayOfMonth = Number.parseInt(input.dayOfMonth, 10);
  if (!Number.isFinite(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    return { field: "dayOfMonth", message: getBillInvalidDayToast() };
  }

  return null;
}