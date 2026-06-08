import { formatString } from "../i18n/format";
import { getRuntimeStrings } from "../i18n/runtime";
import { getWriteFailureToast } from "../i18n/toasts";
import { isAccountsStorageCorrupt, isTransfersStorageCorrupt } from "./accountRepository";
import { isBudgetLimitsStorageCorrupt } from "./budgetRepository";
import { isExpenseCategoriesStorageCorrupt } from "./categoryRepository";
import { isKeyCorrupt, removeKeys } from "./storage";
import { EXPORTABLE_STORAGE_KEYS, STORAGE_KEYS } from "./storageSchema";
import { isMomentsStorageCorrupt, isPatternFeedbackStorageCorrupt } from "./spendingMemoryRepository";

export type StorageHealthIssue = {
  key: string;
  label: string;
};

const CORRUPT_STORAGE_CHECKS: Array<{ check: () => boolean; key: string }> = [
  { check: isMomentsStorageCorrupt, key: STORAGE_KEYS.moments },
  { check: isPatternFeedbackStorageCorrupt, key: STORAGE_KEYS.patternFeedback },
  { check: isAccountsStorageCorrupt, key: STORAGE_KEYS.accounts },
  { check: isTransfersStorageCorrupt, key: STORAGE_KEYS.transfers },
  { check: isBudgetLimitsStorageCorrupt, key: STORAGE_KEYS.budgetLimits },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.monthlyPlans),
    key: STORAGE_KEYS.monthlyPlans
  },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.manualTemplates),
    key: STORAGE_KEYS.manualTemplates
  },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.categoryModes),
    key: STORAGE_KEYS.categoryModes
  },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.savingsGoals),
    key: STORAGE_KEYS.savingsGoals
  },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.recurringBills),
    key: STORAGE_KEYS.recurringBills
  },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.balanceAnchor),
    key: STORAGE_KEYS.balanceAnchor
  },
  { check: isExpenseCategoriesStorageCorrupt, key: STORAGE_KEYS.expenseCategories }
];

export function listCorruptStorageIssues(): StorageHealthIssue[] {
  return CORRUPT_STORAGE_CHECKS.filter((entry) => entry.check()).map((entry) => ({
    key: entry.key,
    label: getStorageKeyLabel(entry.key)
  }));
}

export function isResettableStorageKey(key: string): key is (typeof EXPORTABLE_STORAGE_KEYS)[number] {
  return (EXPORTABLE_STORAGE_KEYS as readonly string[]).includes(key);
}

export async function resetStorageKey(key: string): Promise<boolean> {
  if (!isResettableStorageKey(key)) {
    return false;
  }

  return removeKeys([key]);
}

export function getStorageKeyLabel(key: string): string {
  const collections = getRuntimeStrings().storage.collections;
  return collections[key] ?? key;
}

export function formatSkippedExportWarning(skippedKeys: string[]): string {
  if (skippedKeys.length === 0) {
    return "";
  }

  const strings = getRuntimeStrings().storage;
  const labels = skippedKeys.map((key) => getStorageKeyLabel(key));
  if (labels.length === 1) {
    return formatString(strings.exportSkippedOne, { label: labels[0]! });
  }

  return formatString(strings.exportSkippedMany, {
    list: labels.slice(0, -1).join(", "),
    last: labels[labels.length - 1]!
  });
}

export function getWriteFailureMessage(storageKey: string): string {
  return getWriteFailureToast(storageKey);
}