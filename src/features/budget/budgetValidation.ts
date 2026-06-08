import { getAccountNeedNameToast, getBalanceNeedFieldsToast } from "../../i18n";
import { FormValidationError } from "../../lib/formValidation";
import { parseAmountInput } from "../../lib/formatMoney";

export type AccountFieldError = "label";

export function getAccountValidationError(label: string): FormValidationError<AccountFieldError> | null {
  if (!label.trim()) {
    return { field: "label", message: getAccountNeedNameToast() };
  }
  return null;
}

export type BalanceFieldError = "accountLabel" | "amount";

export function getBalanceAnchorValidationError(
  amount: string
): FormValidationError<BalanceFieldError> | null {
  if (!parseAmountInput(amount)) {
    return { field: "amount", message: getBalanceNeedFieldsToast() };
  }
  return null;
}