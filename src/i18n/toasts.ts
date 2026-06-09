import { formatRupiah } from "../lib/spendingMemoryPatterns";
import { isKeyCorrupt } from "../services/storage";
import type { ImportErrorCode } from "../services/storageBackup";
import { formatString } from "./format";
import { getRuntimeStrings } from "./runtime";

export function getDefaultToastMessage(): string {
  return getRuntimeStrings().toasts.default;
}

function getStorageCollectionLabel(storageKey: string): string {
  const collections = getRuntimeStrings().storage.collections;
  return collections[storageKey] ?? storageKey;
}

export function getWriteFailureToast(storageKey: string): string {
  const area = getStorageCollectionLabel(storageKey);
  const strings = getRuntimeStrings().toasts.writeFailure;
  const template = isKeyCorrupt(storageKey) ? strings.corrupt : strings.generic;
  return formatString(template, { area });
}

export function getTemplateReadyToast(label: string): string {
  return formatString(getRuntimeStrings().toasts.capture.templateReady, { label });
}

export function getImportErrorToast(code: ImportErrorCode, key?: string): string {
  const strings = getRuntimeStrings().toasts.backup;
  switch (code) {
    case "invalid_backup":
      return strings.invalidBackup;
    case "invalid_collection":
      return formatString(strings.invalidCollection, { label: getStorageCollectionLabel(key ?? "") });
    case "restore_failed":
      return formatString(strings.restoreFailed, { label: getStorageCollectionLabel(key ?? "") });
    case "empty_backup":
      return strings.emptyBackup;
    case "normalize_failed":
      return strings.normalizeFailed;
  }
}

export function getBackupShareTitle(): string {
  return getRuntimeStrings().toasts.backup.shareTitle;
}

export function getCaptureNeedAmountToast(): string {
  return getRuntimeStrings().toasts.capture.needAmount;
}

export function getCaptureNeedCategoryToast(): string {
  return getRuntimeStrings().toasts.capture.needCategory;
}

export function getCaptureNeedAccountToast(): string {
  return getRuntimeStrings().toasts.capture.needAccount;
}

export function getCaptureNeedTransferAccountsToast(): string {
  return getRuntimeStrings().toasts.capture.needTransferAccounts;
}

export function getCaptureNeedDateToast(): string {
  return getRuntimeStrings().toasts.capture.needDate;
}

export function getTransferMovedToast(amount: number, from: string, to: string): string {
  return formatString(getRuntimeStrings().toasts.capture.transferMoved, {
    amount: formatRupiah(amount),
    from,
    to
  });
}

export function getIncomeSavedToast(amount: number, source?: string): string {
  const strings = getRuntimeStrings().toasts.capture;
  const formattedAmount = formatRupiah(amount);
  if (source) {
    return formatString(strings.incomeSavedFrom, { amount: formattedAmount, source });
  }
  return formatString(strings.incomeSaved, { amount: formattedAmount });
}

export function getExpenseSavedToast(amount: number, label?: string): string {
  const strings = getRuntimeStrings().toasts.capture;
  const formattedAmount = formatRupiah(amount);
  if (label) {
    return formatString(strings.expenseSavedFor, { amount: formattedAmount, label });
  }
  return formatString(strings.expenseSaved, { amount: formattedAmount });
}

export function getMemoryRemovedToast(): string {
  return getRuntimeStrings().toasts.memory.removed;
}

export function getMemoryRestoredToast(): string {
  return getRuntimeStrings().toasts.memory.restored;
}

export function getPatternFeedbackSavedToast(): string {
  return getRuntimeStrings().patterns.recap.feedbackSaved;
}

export function getBootFailedToast(): string {
  return getRuntimeStrings().toasts.boot.failed;
}

export function getRefreshFailedToast(): string {
  return getRuntimeStrings().toasts.refresh.failed;
}

export function getMemoryNeedAmountToast(): string {
  return getRuntimeStrings().toasts.memory.needAmount;
}

export function getMemoryNotFoundToast(): string {
  return getRuntimeStrings().toasts.memory.notFound;
}

export function getMemoryUpdatedToast(): string {
  return getRuntimeStrings().toasts.memory.updated;
}

export function getShortcutTransferUseChipsToast(): string {
  return getRuntimeStrings().toasts.shortcut.transferUseChips;
}

export function getShortcutNeedLabelToast(): string {
  return getRuntimeStrings().toasts.shortcut.needLabel;
}

export function getShortcutSavedToast(label: string): string {
  return formatString(getRuntimeStrings().toasts.shortcut.saved, { label });
}

export function getShortcutRemovedToast(): string {
  return getRuntimeStrings().toasts.shortcut.removed;
}

export function getTransferRemovedToast(): string {
  return getRuntimeStrings().toasts.transfer.removed;
}

export function getTransferUpdatedToast(): string {
  return getRuntimeStrings().toasts.transfer.updated;
}

export function getAccountNeedNameToast(): string {
  return getRuntimeStrings().toasts.account.needName;
}

export function getAccountSavedToast(label: string): string {
  return formatString(getRuntimeStrings().toasts.account.saved, { label });
}

export function getAccountKeepOneToast(): string {
  return getRuntimeStrings().toasts.account.keepOne;
}

export function getAccountRemovedToast(): string {
  return getRuntimeStrings().toasts.account.removed;
}

export function getAccountDuplicateToast(): string {
  return getRuntimeStrings().toasts.account.duplicate;
}

export function getCategoryNeedNameToast(): string {
  return getRuntimeStrings().toasts.category.needName;
}

export function getCategoryDuplicateToast(): string {
  return getRuntimeStrings().toasts.category.duplicate;
}

export function getCategorySavedToast(label: string): string {
  return formatString(getRuntimeStrings().toasts.category.saved, { label });
}

export function getCategoryRemovedToast(label: string): string {
  return formatString(getRuntimeStrings().toasts.category.removed, { label });
}

export function getBillNeedFieldsToast(): string {
  return getRuntimeStrings().toasts.bill.needFields;
}

export function getBillSavedToast(): string {
  return getRuntimeStrings().toasts.bill.saved;
}

export function getBillRemovedToast(): string {
  return getRuntimeStrings().toasts.bill.removed;
}

export function getBalanceNeedFieldsToast(): string {
  return getRuntimeStrings().toasts.balance.needFields;
}

export function getBalanceSavedToast(): string {
  return getRuntimeStrings().toasts.balance.saved;
}

export function getBackupReadyToast(skippedWarning?: string): string {
  const ready = getRuntimeStrings().toasts.backup.ready;
  return skippedWarning ? `${ready} ${skippedWarning}` : ready;
}

export function getBackupExportFailedToast(): string {
  return getRuntimeStrings().toasts.backup.exportFailed;
}

export function getBackupImportedToast(): string {
  return getRuntimeStrings().toasts.backup.imported;
}

export function getBackupInvalidJsonToast(): string {
  return getRuntimeStrings().toasts.backup.invalidJson;
}

export function getResetFailedToast(label: string): string {
  return formatString(getRuntimeStrings().toasts.reset.failed, { label });
}

export function getResetSuccessToast(label: string): string {
  return formatString(getRuntimeStrings().toasts.reset.success, { label });
}

export function getClearAllToast(): string {
  return getRuntimeStrings().toasts.clear.cleared;
}