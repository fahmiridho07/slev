import { DEFAULT_SPENDING_CONTEXTS, normalizeSpendingContext } from "../data/spendingMemory";
import { ExpenseCategory, SpendingContext } from "../features/spendingMemory.types";
import { isKeyCorrupt, readJson, removeKeys, WriteResult, writeJson } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";
import { createId, readNumber, readString, toRecord } from "./storageRecordUtils";

const EXPENSE_CATEGORIES_KEY = STORAGE_KEYS.expenseCategories;

type CategoryInput = {
  hint?: string;
  id?: string;
  label: string;
  monthlyGuide?: number;
};

type StoredExpenseCategory = ExpenseCategory & {
  isArchived?: boolean;
};

export async function listExpenseCategories(): Promise<ExpenseCategory[]> {
  return buildVisibleCategories(await listStoredCategories());
}

export async function saveExpenseCategory(input: CategoryInput): Promise<WriteResult<ExpenseCategory[]>> {
  const stored = await listStoredCategories();
  const visible = buildVisibleCategories(stored);
  const existing = input.id ? visible.find((category) => category.id === input.id) : undefined;
  const now = new Date().toISOString();
  const category = normalizeStoredCategory({
    id: input.id ?? createId(),
    label: input.label,
    hint: "hint" in input ? normalizeCategoryHint(input.hint) : existing?.hint,
    monthlyGuide:
      "monthlyGuide" in input ? normalizeMonthlyGuide(input.monthlyGuide) : existing?.monthlyGuide,
    isDefault: existing?.isDefault ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  });
  if (!category) return { data: visible, persisted: false, reason: "invalid" };
  const duplicateVisible = visible.find(
    (item) => item.id !== category.id && item.label.toLowerCase() === category.label.toLowerCase()
  );
  if (duplicateVisible) return { data: visible, persisted: false, reason: "duplicate" };

  const updatedStored = [
    category,
    ...stored.filter(
      (item) => item.id !== category.id && item.label.toLowerCase() !== category.label.toLowerCase()
    )
  ];
  const persisted = await writeJson(EXPENSE_CATEGORIES_KEY, compactStoredCategories(updatedStored));
  return { data: buildVisibleCategories(updatedStored), persisted };
}

export async function deleteExpenseCategory(id: string): Promise<WriteResult<ExpenseCategory[]>> {
  const stored = await listStoredCategories();
  const visible = buildVisibleCategories(stored);
  const category = visible.find((item) => item.id === id);
  if (!category) return { data: visible, persisted: true };
  const categoryKey = category.label.toLowerCase();

  const updatedStored = category.isDefault
    ? [
        {
          ...category,
          isArchived: true,
          updatedAt: new Date().toISOString()
        },
        ...stored.filter((item) => item.id !== category.id && item.label.toLowerCase() !== categoryKey)
      ]
    : stored.filter((item) => item.id !== category.id);

  const persisted = await writeJson(EXPENSE_CATEGORIES_KEY, compactStoredCategories(updatedStored));
  return { data: buildVisibleCategories(updatedStored), persisted };
}

export async function clearExpenseCategories(): Promise<boolean> {
  return removeKeys([EXPENSE_CATEGORIES_KEY]);
}

export function isExpenseCategoriesStorageCorrupt(): boolean {
  return isKeyCorrupt(EXPENSE_CATEGORIES_KEY);
}

export function getCategoryLabels(categories: ExpenseCategory[]): SpendingContext[] {
  return categories.map((category) => category.label);
}

async function listStoredCategories(): Promise<StoredExpenseCategory[]> {
  const result = await readJson<unknown>(EXPENSE_CATEGORIES_KEY);
  if (result.status !== "ok" || !Array.isArray(result.value)) return [];
  return result.value.map(normalizeStoredCategory).filter(isStoredExpenseCategory);
}

function buildVisibleCategories(stored: StoredExpenseCategory[]): ExpenseCategory[] {
  const hiddenDefaults = new Set(
    stored
      .filter((category) => category.isArchived)
      .map((category) => category.label.toLowerCase())
  );
  const defaults = getDefaultCategories().filter(
    (category) => !hiddenDefaults.has(category.label.toLowerCase())
  );
  const custom = stored.filter((category) => !category.isArchived && !category.isDefault);
  const byLabel = new Map<string, ExpenseCategory>();

  [...defaults, ...custom].forEach((category) => {
    byLabel.set(category.label.toLowerCase(), stripArchiveFlag(category));
  });

  return Array.from(byLabel.values()).sort(sortCategories);
}

function compactStoredCategories(categories: StoredExpenseCategory[]): StoredExpenseCategory[] {
  const byLabel = new Map<string, StoredExpenseCategory>();
  categories.forEach((category) => {
    const key = category.label.toLowerCase();
    const existing = byLabel.get(key);
    if (!existing || Date.parse(category.updatedAt) >= Date.parse(existing.updatedAt)) {
      byLabel.set(key, category);
    }
  });

  return Array.from(byLabel.values())
    .filter((category) => category.isArchived || !category.isDefault)
    .sort(sortCategories);
}

function getDefaultCategories(): ExpenseCategory[] {
  return DEFAULT_SPENDING_CONTEXTS.map((label) => ({
    id: `default-${label.toLowerCase()}`,
    label,
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  }));
}

function normalizeStoredCategory(value: unknown): StoredExpenseCategory | null {
  const record = toRecord(value);
  if (!record) return null;
  const label = normalizeSpendingContext(readString(record, "label"));
  if (!label) return null;
  const now = new Date().toISOString();

  return {
    id: readString(record, "id") ?? createId(),
    label,
    hint: normalizeCategoryHint(readString(record, "hint")),
    monthlyGuide: normalizeMonthlyGuide(readNumber(record, "monthlyGuide")),
    isDefault: readBoolean(record, "isDefault") ?? DEFAULT_SPENDING_CONTEXTS.includes(label),
    isArchived: readBoolean(record, "isArchived") ?? false,
    createdAt: readString(record, "createdAt") ?? now,
    updatedAt: readString(record, "updatedAt") ?? now
  };
}

function stripArchiveFlag(category: StoredExpenseCategory): ExpenseCategory {
  return {
    id: category.id,
    label: category.label,
    hint: category.hint,
    monthlyGuide: category.monthlyGuide,
    isDefault: category.isDefault,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
}

function normalizeCategoryHint(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeMonthlyGuide(value?: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : undefined;
}

function sortCategories(a: ExpenseCategory, b: ExpenseCategory): number {
  if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
  if (a.isDefault && b.isDefault) {
    return DEFAULT_SPENDING_CONTEXTS.indexOf(a.label) - DEFAULT_SPENDING_CONTEXTS.indexOf(b.label);
  }
  return a.label.localeCompare(b.label);
}

function readBoolean(record: Record<string, unknown>, key: string): boolean | undefined {
  const value = record[key];
  return typeof value === "boolean" ? value : undefined;
}

function isStoredExpenseCategory(value: StoredExpenseCategory | null): value is StoredExpenseCategory {
  return value !== null;
}