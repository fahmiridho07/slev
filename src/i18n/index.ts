import { en } from "./en";
import { id } from "./id";
import type { AppStrings, Locale } from "./types";

export { displayContext } from "./display";
export { getCategoryDeleteMessage } from "./dialogs";
export {
  getAccountKeepOneToast,
  getAccountNeedNameToast,
  getAccountRemovedToast,
  getAccountSavedToast,
  getBackupExportFailedToast,
  getBackupImportedToast,
  getBackupInvalidJsonToast,
  getBackupReadyToast,
  getBackupShareTitle,
  getImportErrorToast,
  getTemplateReadyToast,
  getBalanceNeedFieldsToast,
  getBalanceSavedToast,
  getBillInvalidDayToast,
  getBillLoggedPartialToast,
  getBillLoggedToast,
  getBillNeedFieldsToast,
  getBillRemovedToast,
  getBillSavedToast,
  getBillUnavailableToast,
  getCaptureNeedAmountToast,
  getCaptureNeedCategoryToast,
  getCaptureNeedTransferAccountsToast,
  getCategoryNeedNameToast,
  getCategoryRemovedToast,
  getCategorySavedToast,
  getClearAllToast,
  getDefaultToastMessage,
  getExpenseSavedToast,
  getGoalNeedFieldsToast,
  getGoalRemovedToast,
  getGoalSavedToast,
  getIncomeSavedToast,
  getLimitMarkedAsToast,
  getLimitNeedAmountToast,
  getLimitRemovedToast,
  getLimitSavedToast,
  getMemoryNeedAmountToast,
  getMemoryRemovedToast,
  getMemoryUpdatedToast,
  getPlanSavedToast,
  getResetFailedToast,
  getResetSuccessToast,
  getShortcutNeedLabelToast,
  getShortcutRemovedToast,
  getShortcutSavedToast,
  getShortcutTransferUseChipsToast,
  getTransferMovedToast,
  getTransferRemovedToast,
  getWriteFailureToast
} from "./toasts";
export { formatString, plural } from "./format";
export { getRuntimeLocale, getRuntimeStrings, setRuntimeLocale } from "./runtime";
export type { AppStrings, ListHintCopy, Locale } from "./types";

export function getStrings(locale: Locale): AppStrings {
  return locale === "id" ? id : en;
}