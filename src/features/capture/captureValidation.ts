import {
  getCaptureNeedAccountToast,
  getCaptureNeedAmountToast,
  getCaptureNeedCategoryToast,
  getCaptureNeedDateToast,
  getCaptureNeedTransferAccountsToast
} from "../../i18n";
import { FormValidationError } from "../../lib/formValidation";
import { parseAmountInput } from "../../lib/formatMoney";
import { isFutureDateKey } from "./captureDate";
import { CaptureFormValues } from "./types";

export type CaptureFieldError =
  | "amount"
  | "category"
  | "momentAccount"
  | "occurredAt"
  | "transferAccounts";

export type CaptureValidationError = FormValidationError<CaptureFieldError>;

export function getCaptureValidationError(
  capture: CaptureFormValues,
  categoryCount: number
): CaptureValidationError | null {
  const amount = parseAmountInput(capture.amountText);
  if (!amount) {
    return { field: "amount", message: getCaptureNeedAmountToast() };
  }

  if (capture.entryType === "expense" || capture.entryType === "income") {
    if (!capture.accountLabel || !capture.accountLabel.trim()) {
      return { field: "momentAccount", message: getCaptureNeedAccountToast() };
    }
  }

  if (capture.entryType === "expense" && categoryCount === 0) {
    return { field: "category", message: getCaptureNeedCategoryToast() };
  }

  if (capture.entryType === "transfer") {
    if (!capture.fromAccount || !capture.toAccount || capture.fromAccount === capture.toAccount) {
      return { field: "transferAccounts", message: getCaptureNeedTransferAccountsToast() };
    }
  }

  if (capture.occurredAtKey && isFutureDateKey(capture.occurredAtKey)) {
    return { field: "occurredAt", message: getCaptureNeedDateToast() };
  }

  return null;
}