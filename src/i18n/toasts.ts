import { formatRupiah } from "../lib/spendingMemoryPatterns";
import { isKeyCorrupt } from "../services/storage";
import { formatString } from "./format";
import { getRuntimeStrings } from "./runtime";

export function getDefaultToastMessage(): string {
  return getRuntimeStrings().toasts.default;
}

export function getWriteFailureToast(area: string, storageKey?: string): string {
  const strings = getRuntimeStrings().toasts.writeFailure;
  const template = storageKey && isKeyCorrupt(storageKey) ? strings.corrupt : strings.generic;
  return formatString(template, { area });
}

export function getCaptureNeedAmountToast(): string {
  return getRuntimeStrings().toasts.capture.needAmount;
}

export function getCaptureNeedCategoryToast(): string {
  return getRuntimeStrings().toasts.capture.needCategory;
}

export function getCaptureNeedTransferAccountsToast(): string {
  return getRuntimeStrings().toasts.capture.needTransferAccounts;
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

export function getMemoryNeedAmountToast(): string {
  return getRuntimeStrings().toasts.memory.needAmount;
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

export function getCategoryNeedNameToast(): string {
  return getRuntimeStrings().toasts.category.needName;
}

export function getCategorySavedToast(label: string): string {
  return formatString(getRuntimeStrings().toasts.category.saved, { label });
}

export function getCategoryRemovedToast(label: string): string {
  return formatString(getRuntimeStrings().toasts.category.removed, { label });
}

export function getLimitNeedAmountToast(): string {
  return getRuntimeStrings().toasts.limit.needAmount;
}

export function getLimitSavedToast(category: string, period: "weekly" | "monthly"): string {
  const strings = getRuntimeStrings().toasts.limit;
  const template = period === "weekly" ? strings.savedWeek : strings.savedMonth;
  return formatString(template, { category });
}

export function getLimitRemovedToast(category: string): string {
  return formatString(getRuntimeStrings().toasts.limit.removed, { category });
}

export function getLimitMarkedAsToast(category: string, mode: string): string {
  return formatString(getRuntimeStrings().toasts.limit.markedAs, { category, mode });
}

export function getPlanSavedToast(): string {
  return getRuntimeStrings().toasts.plan.saved;
}

export function getGoalNeedFieldsToast(): string {
  return getRuntimeStrings().toasts.goal.needFields;
}

export function getGoalSavedToast(): string {
  return getRuntimeStrings().toasts.goal.saved;
}

export function getGoalRemovedToast(): string {
  return getRuntimeStrings().toasts.goal.removed;
}

export function getBillNeedFieldsToast(): string {
  return getRuntimeStrings().toasts.bill.needFields;
}

export function getBillInvalidDayToast(): string {
  return getRuntimeStrings().toasts.bill.invalidDay;
}

export function getBillSavedToast(): string {
  return getRuntimeStrings().toasts.bill.saved;
}

export function getBillRemovedToast(): string {
  return getRuntimeStrings().toasts.bill.removed;
}

export function getBillUnavailableToast(): string {
  return getRuntimeStrings().toasts.bill.unavailable;
}

export function getBillLoggedPartialToast(amount: number): string {
  return formatString(getRuntimeStrings().toasts.bill.loggedPartial, {
    amount: formatRupiah(amount)
  });
}

export function getBillLoggedToast(amount: number, label: string): string {
  return formatString(getRuntimeStrings().toasts.bill.logged, {
    amount: formatRupiah(amount),
    label
  });
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