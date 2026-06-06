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

const CORRUPT_STORAGE_CHECKS: Array<{ check: () => boolean; key: string; label: string }> = [
  { check: isMomentsStorageCorrupt, key: STORAGE_KEYS.moments, label: "Spending memories" },
  { check: isPatternFeedbackStorageCorrupt, key: STORAGE_KEYS.patternFeedback, label: "Pattern feedback" },
  { check: isAccountsStorageCorrupt, key: STORAGE_KEYS.accounts, label: "Accounts" },
  { check: isTransfersStorageCorrupt, key: STORAGE_KEYS.transfers, label: "Transfers" },
  { check: isBudgetLimitsStorageCorrupt, key: STORAGE_KEYS.budgetLimits, label: "Budget limits" },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.monthlyPlans),
    key: STORAGE_KEYS.monthlyPlans,
    label: "Monthly plans"
  },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.manualTemplates),
    key: STORAGE_KEYS.manualTemplates,
    label: "Shortcuts"
  },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.categoryModes),
    key: STORAGE_KEYS.categoryModes,
    label: "Category modes"
  },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.savingsGoals),
    key: STORAGE_KEYS.savingsGoals,
    label: "Savings goals"
  },
  {
    check: () => isKeyCorrupt(STORAGE_KEYS.balanceSnapshots),
    key: STORAGE_KEYS.balanceSnapshots,
    label: "Balance snapshots"
  },
  { check: isExpenseCategoriesStorageCorrupt, key: STORAGE_KEYS.expenseCategories, label: "Expense categories" }
];

export function listCorruptStorageIssues(): StorageHealthIssue[] {
  return CORRUPT_STORAGE_CHECKS.filter((entry) => entry.check()).map((entry) => ({
    key: entry.key,
    label: entry.label
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
  return CORRUPT_STORAGE_CHECKS.find((entry) => entry.key === key)?.label ?? key;
}

export function formatSkippedExportWarning(skippedKeys: string[]): string {
  if (skippedKeys.length === 0) {
    return "";
  }

  const labels = skippedKeys.map((key) => getStorageKeyLabel(key));
  if (labels.length === 1) {
    return `Note: ${labels[0]} looked damaged and was not included.`;
  }

  return `Note: ${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]} looked damaged and were not included.`;
}

export function getWriteFailureMessage(area: string, storageKey?: string): string {
  if (storageKey && isKeyCorrupt(storageKey)) {
    return `${area} on this device looks damaged and was left unchanged. Export a backup in Settings, then re-import.`;
  }

  return `Could not save ${area} to this device. Check storage space or export a backup in Settings.`;
}