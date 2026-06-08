import { DEFAULT_SPENDING_CONTEXTS, normalizeSpendingContext } from "../data/spendingMemory";
import {
  CategoryMode,
  EntryType,
  ManualTemplate,
  MonthlyPlan,
  SavingsGoal,
  SpendingContext
} from "../features/spendingMemory.types";
import {
  cleanOptionalText,
  createId,
  readNumber,
  readString,
  toRecord
} from "./storageRecordUtils";
import { isKeyCorrupt, readJson, removeKeys, WriteResult, writeJson } from "./storage";

const MONTHLY_PLANS_KEY = "slev_monthly_plans";
const MANUAL_TEMPLATES_KEY = "slev_manual_templates";
const CATEGORY_MODES_KEY = "slev_category_modes";
const SAVINGS_GOALS_KEY = "slev_savings_goals";

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

export async function getMonthlyPlan(month: string): Promise<MonthlyPlan | null> {
  const plans = await listMonthlyPlans();
  return plans.find((plan) => plan.month === normalizeMonth(month)) ?? null;
}

export async function saveMonthlyPlan(input: MonthlyPlanInput): Promise<WriteResult<MonthlyPlan>> {
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
    return {
      data: existing ?? {
        id: createId(),
        month: normalizeMonth(input.month),
        expectedIncome: normalizeAmount(input.expectedIncome),
        fixedCosts: normalizeAmount(input.fixedCosts),
        flexibleBudget: normalizeAmount(input.flexibleBudget),
        savingsTarget: normalizeAmount(input.savingsTarget),
        note: cleanOptionalText(input.note),
        createdAt: now,
        updatedAt: now
      },
      persisted: true
    };
  }
  const updated = [
    plan,
    ...plans.filter((item) => item.month !== plan.month)
  ].sort((a, b) => b.month.localeCompare(a.month));
  const persisted = await writeJson(MONTHLY_PLANS_KEY, updated);
  return { data: plan, persisted };
}

export async function listManualTemplates(): Promise<ManualTemplate[]> {
  const result = await readJson<unknown>(MANUAL_TEMPLATES_KEY);
  if (result.status !== "ok" || !Array.isArray(result.value)) return [];
  return result.value.map(normalizeManualTemplate).filter(isManualTemplate);
}

export async function saveManualTemplate(input: ManualTemplateInput): Promise<WriteResult<ManualTemplate[]>> {
  const current = await listManualTemplates();
  const now = new Date().toISOString();
  const template = normalizeManualTemplate({
    ...input,
    id: createId(),
    occurredAt: now,
    createdAt: now,
    updatedAt: now
  });
  if (!template) return { data: current, persisted: true };

  const updated = [template, ...current].slice(0, 12);
  const persisted = await writeJson(MANUAL_TEMPLATES_KEY, updated);
  return { data: updated, persisted };
}

export async function deleteManualTemplate(id: string): Promise<WriteResult<ManualTemplate[]>> {
  const current = await listManualTemplates();
  const updated = current.filter((template) => template.id !== id);
  const persisted = await writeJson(MANUAL_TEMPLATES_KEY, updated);
  return { data: updated, persisted };
}

export async function listCategoryModes(): Promise<CategoryMode[]> {
  const result = await readJson<unknown>(CATEGORY_MODES_KEY);
  if (result.status !== "ok") return getDefaultCategoryModes();
  if (!Array.isArray(result.value)) return getDefaultCategoryModes();
  return mergeCategoryModes(result.value.map(normalizeCategoryMode).filter(isCategoryMode));
}

export async function saveCategoryMode(
  category: SpendingContext,
  mode: CategoryModeValue
): Promise<WriteResult<CategoryMode[]>> {
  const current = await listCategoryModes();
  const updated = mergeCategoryModes([
    { category, mode },
    ...current.filter((item) => item.category !== category)
  ]);
  const persisted = await writeJson(CATEGORY_MODES_KEY, updated);
  return { data: updated, persisted };
}

export async function deleteCategoryMode(category: SpendingContext): Promise<WriteResult<CategoryMode[]>> {
  const current = await listCategoryModes();
  const updated = mergeCategoryModes(current.filter((item) => item.category !== category));
  const persisted = await writeJson(CATEGORY_MODES_KEY, updated);
  return { data: updated, persisted };
}

export async function listSavingsGoals(): Promise<SavingsGoal[]> {
  const result = await readJson<unknown>(SAVINGS_GOALS_KEY);
  if (result.status !== "ok" || !Array.isArray(result.value)) return [];
  return result.value.map(normalizeSavingsGoal).filter(isSavingsGoal);
}

export async function saveSavingsGoal(input: SavingsGoalInput): Promise<WriteResult<SavingsGoal[]>> {
  const current = await listSavingsGoals();
  const now = new Date().toISOString();
  const existing = input.id ? current.find((goal) => goal.id === input.id) : undefined;
  const goal = normalizeSavingsGoal({
    ...input,
    id: input.id ?? createId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  });
  if (!goal) return { data: current, persisted: true };

  const updated = [
    goal,
    ...current.filter((item) => item.id !== goal.id)
  ].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const persisted = await writeJson(SAVINGS_GOALS_KEY, updated);
  return { data: updated, persisted };
}

export async function deleteSavingsGoal(id: string): Promise<WriteResult<SavingsGoal[]>> {
  const current = await listSavingsGoals();
  const updated = current.filter((goal) => goal.id !== id);
  const persisted = await writeJson(SAVINGS_GOALS_KEY, updated);
  return { data: updated, persisted };
}

export async function rewriteAccountLabelInManualTemplates(
  oldLabel: string,
  newLabel: string
): Promise<boolean> {
  if (oldLabel === newLabel) return true;

  const current = await listManualTemplates();
  let changed = false;
  const updated = current.map((template) => {
    if (template.accountLabel !== oldLabel) return template;
    changed = true;
    return {
      ...template,
      accountLabel: newLabel,
      updatedAt: new Date().toISOString()
    };
  });
  if (!changed) return true;

  return writeJson(MANUAL_TEMPLATES_KEY, updated);
}

export async function clearManualFinance(): Promise<boolean> {
  return removeKeys([
    MONTHLY_PLANS_KEY,
    MANUAL_TEMPLATES_KEY,
    CATEGORY_MODES_KEY,
    SAVINGS_GOALS_KEY
  ]);
}

export function isManualFinanceStorageCorrupt(): boolean {
  return (
    isKeyCorrupt(MONTHLY_PLANS_KEY) ||
    isKeyCorrupt(MANUAL_TEMPLATES_KEY) ||
    isKeyCorrupt(CATEGORY_MODES_KEY) ||
    isKeyCorrupt(SAVINGS_GOALS_KEY)
  );
}

async function listMonthlyPlans(): Promise<MonthlyPlan[]> {
  const result = await readJson<unknown>(MONTHLY_PLANS_KEY);
  if (result.status !== "ok" || !Array.isArray(result.value)) return [];
  return result.value.map(normalizeMonthlyPlan).filter(isMonthlyPlan);
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

function normalizeAmount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function normalizeMonth(value: string | undefined): string {
  return /^\d{4}-\d{2}$/.test(String(value ?? "")) ? String(value) : new Date().toISOString().slice(0, 7);
}

