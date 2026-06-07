import {
  getCaptureNeedAmountToast,
  getCaptureNeedCategoryToast,
  getCaptureNeedTransferAccountsToast
} from "../../i18n";
import { parseAmountInput } from "../../lib/formatMoney";
import { CaptureFormValues } from "./types";

export type CaptureFieldError = "amount" | "category" | "transferAccounts";

export type CaptureValidationError = {
  field: CaptureFieldError;
  message: string;
};

export function getCaptureValidationError(
  capture: CaptureFormValues,
  categoryCount: number
): CaptureValidationError | null {
  const amount = parseAmountInput(capture.amountText);
  if (!amount) {
    return { field: "amount", message: getCaptureNeedAmountToast() };
  }

  if (capture.entryType === "expense" && categoryCount === 0) {
    return { field: "category", message: getCaptureNeedCategoryToast() };
  }

  if (capture.entryType === "transfer") {
    if (!capture.fromAccount || !capture.toAccount || capture.fromAccount === capture.toAccount) {
      return { field: "transferAccounts", message: getCaptureNeedTransferAccountsToast() };
    }
  }

  return null;
}