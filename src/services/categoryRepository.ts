import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_SPENDING_CONTEXTS, normalizeSpendingContext } from "../data/spendingMemory";
import { ExpenseCategory, SpendingContext } from "../features/spendingMemory.types";

const EXPENSE_CATEGORIES_KEY = "slev_expense_categories";

type CategoryInput = {
  id?: string;
  label: string;
};

type StoredExpenseCategory = ExpenseCategory & {
  isArchived?: boolean;
};

export async function listExpenseCategories(): Promise<ExpenseCategory[]> {
  return buildVisibleCategories(await listStoredCategories());
}

export async function saveExpenseCategory(input: CategoryInput): Promise<ExpenseCategory[]> {
  const stored = await listStoredCategories();
  const visible = buildVisibleCategories(stored);
  const existing = input.id ? visible.find((category) => category.id === input.id) : undefined;
  const now = new Date().toISOString();
  const category = normalizeStoredCategory({
    id: input.id ?? createId(),
    label: input.label,
    isDefault: false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  });
  if (!category) return visible;
  const duplicateVisible = visible.find(
    (item) => item.id !== category.id && item.label.toLowerCase() === category.label.toLowerCase()
  );
  if (duplicateVisible) return visible;

  const updatedStored = [
    category,
    ...stored.filter(
      (item) => item.id !== category.id && item.label.toLowerCase() !== category.label.toLowerCase()
    )
  ];
  await writeJson(EXPENSE_CATEGORIES_KEY, compactStoredCategories(updatedStored));
  return buildVisibleCategories(updatedStored);
}

export async function deleteExpenseCategory(id: string): Promise<ExpenseCategory[]> {
  const stored = await listStoredCategories();
  const visible = buildVisibleCategories(stored);
  const category = visible.find((item) => item.id === id);
  if (!category) return visible;
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

  await writeJson(EXPENSE_CATEGORIES_KEY, compactStoredCategories(updatedStored));
  return buildVisibleCategories(updatedStored);
}

export async function clearExpenseCategories(): Promise<void> {
  try {
    await AsyncStorage.removeItem(EXPENSE_CATEGORIES_KEY);
  } catch {
    return;
  }
}

export function getCategoryLabels(categories: ExpenseCategory[]): SpendingContext[] {
  return categories.map((category) => category.label);
}

async function listStoredCategories(): Promise<StoredExpenseCategory[]> {
  const raw = await readStorage(EXPENSE_CATEGORIES_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeStoredCategory).filter(isStoredExpenseCategory);
  } catch {
    return [];
  }
}

async function readStorage(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
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
    isDefault: category.isDefault,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
}

function sortCategories(a: ExpenseCategory, b: ExpenseCategory): number {
  if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
  if (a.isDefault && b.isDefault) {
    return DEFAULT_SPENDING_CONTEXTS.indexOf(a.label) - DEFAULT_SPENDING_CONTEXTS.indexOf(b.label);
  }
  return a.label.localeCompare(b.label);
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function readBoolean(record: Record<string, unknown>, key: string): boolean | undefined {
  const value = record[key];
  return typeof value === "boolean" ? value : undefined;
}

function isStoredExpenseCategory(value: StoredExpenseCategory | null): value is StoredExpenseCategory {
  return value !== null;
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
