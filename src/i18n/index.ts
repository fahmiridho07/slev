import { en } from "./en";
import { id } from "./id";
import type { AppStrings, Locale } from "./types";

export { displayContext } from "./display";
export { getCategoryDeleteMessage } from "./dialogs";
export {
  getAccountDuplicateToast,
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
  getBillNeedFieldsToast,
  getBillRemovedToast,
  getBillSavedToast,
  getCaptureNeedAccountToast,
  getCaptureNeedAmountToast,
  getCaptureNeedCategoryToast,
  getCaptureNeedDateToast,
  getCaptureNeedTransferAccountsToast,
  getCategoryDuplicateToast,
  getCategoryNeedNameToast,
  getCategoryRemovedToast,
  getCategorySavedToast,
  getClearAllToast,
  getDefaultToastMessage,
  getExpenseSavedToast,
  getIncomeSavedToast,
  getMemoryNeedAmountToast,
  getMemoryRemovedToast,
  getMemoryUpdatedToast,
  getResetFailedToast,
  getResetSuccessToast,
  getShortcutNeedLabelToast,
  getShortcutRemovedToast,
  getShortcutSavedToast,
  getShortcutTransferUseChipsToast,
  getTransferMovedToast,
  getTransferRemovedToast,
  getTransferUpdatedToast,
  getWriteFailureToast
} from "./toasts";
export { formatString } from "./format";
export { getRuntimeLocale, getRuntimeStrings, setRuntimeLocale } from "./runtime";
export type { AppStrings, ListHintCopy, Locale } from "./types";

export function getStrings(locale: Locale): AppStrings {
  return locale === "id" ? id : en;
}