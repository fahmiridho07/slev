import {
  getCaptureNeedAmountToast,
  getCaptureNeedCategoryToast,
  getCaptureNeedTransferAccountsToast,
  getShortcutNeedLabelToast,
  getShortcutTransferUseChipsToast
} from "../../i18n";
import { FormValidationError } from "../../lib/formValidation";
import { parseAmountInput } from "../../lib/formatMoney";
import { CaptureFormValues } from "./types";

export type CaptureFieldError = "amount" | "category" | "transferAccounts" | "shortcutLabel" | "shortcutTransfer";

export type CaptureValidationError = FormValidationError<CaptureFieldError>;

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

export function getShortcutValidationError(capture: CaptureFormValues): CaptureValidationError | null {
  if (capture.entryType === "transfer") {
    return { field: "shortcutTransfer", message: getShortcutTransferUseChipsToast() };
  }

  const templateLabel =
    capture.entryType === "income" ? capture.source.trim() : (capture.label.trim() || capture.context);
  if (!templateLabel) {
    return { field: "shortcutLabel", message: getShortcutNeedLabelToast() };
  }

  return null;
}