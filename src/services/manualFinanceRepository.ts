import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_SPENDING_CONTEXTS, normalizeSpendingContext } from "../data/spendingMemory";
import {
  BalanceSnapshot,
  CategoryMode,
  EntryType,
  ManualTemplate,
  MonthlyClosing,
  MonthlyPlan,
  SavingsGoal,
  SpendingContext
} from "../features/spendingMemory.types";

const MONTHLY_PLANS_KEY = "slev_monthly_plans";
const MANUAL_TEMPLATES_KEY = "slev_manual_templates";
const CATEGORY_MODES_KEY = "slev_category_modes";
const SAVINGS_GOALS_KEY = "slev_savings_goals";
const BALANCE_SNAPSHOTS_KEY = "slev_balance_snapshots";
const MONTHLY_CLOSINGS_KEY = "slev_monthly_closings";

type CategoryModeValue = CategoryMode["mode"];

type MonthlyPlanInput = {
  expectedIncome: number;
  fixedCosts: number;
  flexibleBudget: number;
  month: string;
  note?: string;
  savingsTarget: number;
};

type ManualTemplateInput = {
  accountLabel?: string;
  amount?: number;
  context: SpendingContext;
  label?: string;
  note?: string;
  source?: string;
  type: EntryType;
};

type SavingsGoalInput = {
  id?: string;
  label: string;
  savedAmount: number;
  targetAmount: number;
};

type BalanceSnapshotInput = {
  accountLabel: string;
  amount: number;
};

type MonthlyClosingInput = {
  month: string;
  netCashflow: number;
  nextMonthAdjustment?: string;
  totalExpenses: number;
  totalIncome: number;
};

export async function getMonthlyPlan(month: string): Promise<MonthlyPlan | null> {
  const plans = await listMonthlyPlans();
  return plans.find((plan) => plan.month === normalizeMonth(month)) ?? null;
}

export async function saveMonthlyPlan(input: MonthlyPlanInput): Promise<MonthlyPlan> {
  const plans = await listMonthlyPlans();
  const existing = plans.find((plan) => plan.month === normalizeMonth(input.month));
  const now = new Date().toISOString();
  const plan = normalizeMonthlyPlan({
    ...input,
    id: existing?.id ?? createId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  });
  if (!plan) {
    return existing ?? {
      id: createId(),
      month: normalizeMonth(input.month),
      expectedIncome: normalizeAmount(input.expectedIncome),
      fixedCosts: normalizeAmount(input.fixedCosts),
      flexibleBudget: normalizeAmount(input.flexibleBudget),
      savingsTarget: normalizeAmount(input.savingsTarget),
      note: cleanOptionalText(input.note),
      createdAt: now,
      updatedAt: now
    };
  }
  const updated = [
    plan,
    ...plans.filter((item) => item.month !== plan.month)
  ].sort((a, b) => b.month.localeCompare(a.month));
  await writeJson(MONTHLY_PLANS_KEY, updated);
  return plan;
}

export async function listManualTemplates(): Promise<ManualTemplate[]> {
  const raw = await readStorage(MANUAL_TEMPLATES_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeManualTemplate).filter(isManualTemplate);
  } catch {
    return [];
  }
}

export async function saveManualTemplate(input: ManualTemplateInput): Promise<ManualTemplate[]> {
  const current = await listManualTemplates();
  const now = new Date().toISOString();
  const template = normalizeManualTemplate({
    ...input,
    id: createId(),
    occurredAt: now,
    createdAt: now,
    updatedAt: now
  });
  if (!template) return current;

  const updated = [template, ...current].slice(0, 12);
  await writeJson(MANUAL_TEMPLATES_KEY, updated);
  return updated;
}

export async function deleteManualTemplate(id: string): Promise<ManualTemplate[]> {
  const current = await listManualTemplates();
  const updated = current.filter((template) => template.id !== id);
  await writeJson(MANUAL_TEMPLATES_KEY, updated);
  return updated;
}

export async function listCategoryModes(): Promise<CategoryMode[]> {
  const raw = await readStorage(CATEGORY_MODES_KEY);
  if (!raw) return getDefaultCategoryModes();

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return getDefaultCategoryModes();
    return mergeCategoryModes(parsed.map(normalizeCategoryMode).filter(isCategoryMode));
  } catch {
    return getDefaultCategoryModes();
  }
}

export async function saveCategoryMode(category: SpendingContext, mode: CategoryModeValue): Promise<CategoryMode[]> {
  const current = await listCategoryModes();
  const updated = mergeCategoryModes([
    { category, mode },
    ...current.filter((item) => item.category !== category)
  ]);
  await writeJson(CATEGORY_MODES_KEY, updated);
  return updated;
}

export async function listSavingsGoals(): Promise<SavingsGoal[]> {
  const raw = await readStorage(SAVINGS_GOALS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeSavingsGoal).filter(isSavingsGoal);
  } catch {
    return [];
  }
}

export async function saveSavingsGoal(input: SavingsGoalInput): Promise<SavingsGoal[]> {
  const current = await listSavingsGoals();
  const now = new Date().toISOString();
  const existing = input.id ? current.find((goal) => goal.id === input.id) : undefined;
  const goal = normalizeSavingsGoal({
    ...input,
    id: input.id ?? createId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  });
  if (!goal) return current;

  const updated = [
    goal,
    ...current.filter((item) => item.id !== goal.id)
  ].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  await writeJson(SAVINGS_GOALS_KEY, updated);
  return updated;
}

export async function deleteSavingsGoal(id: string): Promise<SavingsGoal[]> {
  const current = await listSavingsGoals();
  const updated = current.filter((goal) => goal.id !== id);
  await writeJson(SAVINGS_GOALS_KEY, updated);
  return updated;
}

export async function listBalanceSnapshots(): Promise<BalanceSnapshot[]> {
  const raw = await readStorage(BALANCE_SNAPSHOTS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeBalanceSnapshot)
      .filter(isBalanceSnapshot)
      .sort((a, b) => Date.parse(b.snapshotDate) - Date.parse(a.snapshotDate));
  } catch {
    return [];
  }
}

export async function saveBalanceSnapshot(input: BalanceSnapshotInput): Promise<BalanceSnapshot[]> {
  const current = await listBalanceSnapshots();
  const now = new Date().toISOString();
  const snapshot = normalizeBalanceSnapshot({
    ...input,
    id: createId(),
    snapshotDate: now,
    createdAt: now
  });
  if (!snapshot) return current;

  const updated = [snapshot, ...current].slice(0, 80);
  await writeJson(BALANCE_SNAPSHOTS_KEY, updated);
  return updated;
}

export async function listMonthlyClosings(): Promise<MonthlyClosing[]> {
  const raw = await readStorage(MONTHLY_CLOSINGS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeMonthlyClosing)
      .filter(isMonthlyClosing)
      .sort((a, b) => b.month.localeCompare(a.month));
  } catch {
    return [];
  }
}

export async function saveMonthlyClosing(input: MonthlyClosingInput): Promise<MonthlyClosing[]> {
  const current = await listMonthlyClosings();
  const existing = current.find((closing) => closing.month === normalizeMonth(input.month));
  const closing = normalizeMonthlyClosing({
    ...input,
    id: existing?.id ?? createId(),
    createdAt: new Date().toISOString()
  });
  if (!closing) return current;

  const updated = [closing, ...current.filter((item) => item.month !== closing.month)];
  await writeJson(MONTHLY_CLOSINGS_KEY, updated);
  return updated;
}

export async function clearManualFinance(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      MONTHLY_PLANS_KEY,
      MANUAL_TEMPLATES_KEY,
      CATEGORY_MODES_KEY,
      SAVINGS_GOALS_KEY,
      BALANCE_SNAPSHOTS_KEY,
      MONTHLY_CLOSINGS_KEY
    ]);
  } catch {
    return;
  }
}

async function listMonthlyPlans(): Promise<MonthlyPlan[]> {
  const raw = await readStorage(MONTHLY_PLANS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeMonthlyPlan).filter(isMonthlyPlan);
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

function normalizeMonthlyPlan(value: unknown): MonthlyPlan | null {
  const record = toRecord(value);
  if (!record) return null;
  const month = normalizeMonth(readString(record, "month") ?? readString(record, "monthKey"));
  const expectedIncome = readNumber(record, "expectedIncome") ?? readNumber(record, "plannedIncome") ?? 0;
  const flexibleBudget = readNumber(record, "flexibleBudget") ?? readNumber(record, "flexibleSpending") ?? 0;
  const now = new Date().toISOString();

  return {
    id: readString(record, "id") ?? createId(),
    month,
    expectedIncome: normalizeAmount(expectedIncome),
    fixedCosts: normalizeAmount(readNumber(record, "fixedCosts") ?? 0),
    flexibleBudget: normalizeAmount(flexibleBudget),
    savingsTarget: normalizeAmount(readNumber(record, "savingsTarget") ?? 0),
    note: cleanOptionalText(readString(record, "note")),
    createdAt: readString(record, "createdAt") ?? readString(record, "updatedAt") ?? now,
    updatedAt: readString(record, "updatedAt") ?? now
  };
}

function normalizeManualTemplate(value: unknown): ManualTemplate | null {
  const record = toRecord(value);
  if (!record) return null;
  const type: EntryType = readString(record, "type") === "income" ? "income" : "expense";
  const label = cleanOptionalText(readString(record, "label") ?? readString(record, "title"));
  const source = cleanOptionalText(readString(record, "source") ?? (type === "income" ? label : undefined));
  const amount = normalizeAmount(readNumber(record, "amount") ?? 0);
  if (amount <= 0 && !label && !source) return null;
  const now = new Date().toISOString();

  return {
    id: readString(record, "id") ?? createId(),
    amount,
    occurredAt: readString(record, "occurredAt") ?? now,
    label: type === "expense" ? label : undefined,
    context: type === "income" ? "Other" : normalizeSpendingContext(readString(record, "context")),
    note: cleanOptionalText(readString(record, "note")),
    type,
    accountLabel: cleanOptionalText(readString(record, "accountLabel")),
    source: type === "income" ? source : undefined,
    createdAt: readString(record, "createdAt") ?? now,
    updatedAt: readString(record, "updatedAt") ?? now
  };
}

function normalizeCategoryMode(value: unknown): CategoryMode | null {
  const record = toRecord(value);
  if (!record) return null;
  const category = normalizeSpendingContext(readString(record, "category"));
  if (!category) return null;

  return {
    category,
    mode: readString(record, "mode") === "fixed" ? "fixed" : "flexible"
  };
}

function normalizeSavingsGoal(value: unknown): SavingsGoal | null {
  const record = toRecord(value);
  if (!record) return null;
  const label = cleanOptionalText(readString(record, "label") ?? readString(record, "title"));
  const targetAmount = normalizeAmount(readNumber(record, "targetAmount") ?? 0);
  if (!label || targetAmount <= 0) return null;
  const now = new Date().toISOString();

  return {
    id: readString(record, "id") ?? createId(),
    label,
    targetAmount,
    savedAmount: Math.min(normalizeAmount(readNumber(record, "savedAmount") ?? 0), targetAmount),
    createdAt: readString(record, "createdAt") ?? now,
    updatedAt: readString(record, "updatedAt") ?? now
  };
}

function normalizeBalanceSnapshot(value: unknown): BalanceSnapshot | null {
  const record = toRecord(value);
  if (!record) return null;
  const accountLabel = cleanOptionalText(readString(record, "accountLabel") ?? readString(record, "label"));
  if (!accountLabel) return null;
  const now = new Date().toISOString();

  return {
    id: readString(record, "id") ?? createId(),
    accountLabel,
    amount: normalizeAmount(readNumber(record, "amount") ?? 0),
    snapshotDate: readString(record, "snapshotDate") ?? readString(record, "capturedAt") ?? now,
    createdAt: readString(record, "createdAt") ?? now
  };
}

function normalizeMonthlyClosing(value: unknown): MonthlyClosing | null {
  const record = toRecord(value);
  if (!record) return null;
  const month = normalizeMonth(readString(record, "month") ?? readString(record, "monthKey"));
  const totalIncome = normalizeAmount(readNumber(record, "totalIncome") ?? 0);
  const totalExpenses = normalizeAmount(readNumber(record, "totalExpenses") ?? 0);
  const netCashflow = readNumber(record, "netCashflow") ?? totalIncome - totalExpenses;
  const now = new Date().toISOString();

  return {
    id: readString(record, "id") ?? createId(),
    month,
    totalIncome,
    totalExpenses,
    netCashflow: Math.round(netCashflow),
    nextMonthAdjustment: cleanOptionalText(
      readString(record, "nextMonthAdjustment") ?? readString(record, "adjustmentNote")
    ),
    createdAt: readString(record, "createdAt") ?? readString(record, "completedAt") ?? now
  };
}

function getDefaultCategoryModes(): CategoryMode[] {
  return DEFAULT_SPENDING_CONTEXTS.map((category) => ({
    category,
    mode: category === "Bills" || category === "Home" ? "fixed" : "flexible"
  }));
}

function mergeCategoryModes(settings: CategoryMode[]): CategoryMode[] {
  const byCategory = new Map(settings.map((setting) => [setting.category, setting.mode]));
  const defaultModes = DEFAULT_SPENDING_CONTEXTS.map((category) => ({
    category,
    mode: byCategory.get(category) ?? (category === "Bills" || category === "Home" ? "fixed" : "flexible")
  }));
  const customModes = settings
    .filter((setting) => !DEFAULT_SPENDING_CONTEXTS.includes(setting.category))
    .sort((a, b) => a.category.localeCompare(b.category));
  return [...defaultModes, ...customModes];
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function isMonthlyPlan(value: MonthlyPlan | null): value is MonthlyPlan {
  return value !== null;
}

function isManualTemplate(value: ManualTemplate | null): value is ManualTemplate {
  return value !== null;
}

function isCategoryMode(value: CategoryMode | null): value is CategoryMode {
  return value !== null;
}

function isSavingsGoal(value: SavingsGoal | null): value is SavingsGoal {
  return value !== null;
}

function isBalanceSnapshot(value: BalanceSnapshot | null): value is BalanceSnapshot {
  return value !== null;
}

function isMonthlyClosing(value: MonthlyClosing | null): value is MonthlyClosing {
  return value !== null;
}

function normalizeAmount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function normalizeMonth(value: string | undefined): string {
  return /^\d{4}-\d{2}$/.test(String(value ?? "")) ? String(value) : new Date().toISOString().slice(0, 7);
}

function cleanOptionalText(value: string | undefined): string | undefined {
  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 80) : undefined;
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
